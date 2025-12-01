// src/routes/auth.ts
import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateRequest } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { loginSchema, registerSchema } from "../validators/auth";
import {
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  refreshTokens,
  revokeToken,
} from "../utils/cognito";
import { COGNITO_ENABLED } from "../utils/env";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { randomBytes, createHash } from "crypto";

const prisma = new PrismaClient();

const router = Router();
const authController = new AuthController();

/**
 * In-memory store mapping OAuth state -> code_verifier.
 * This is suitable for local dev. For production, use a persistent store (Redis)
 * keyed by state and with TTL.
 */
const pkceStore = new Map<string, string>();

/** helper: base64url encode a buffer */
function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** make code_verifier and S256 code_challenge */
function makePkcePair() {
  const code_verifier = base64url(randomBytes(32));
  const sha = createHash("sha256").update(code_verifier).digest();
  const code_challenge = base64url(sha);
  return { code_verifier, code_challenge };
}

/** make a random state string */
function makeState() {
  return base64url(randomBytes(16));
}

router.post(
  "/login",
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register.bind(authController)
);

// OAuth - redirect to Cognito Hosted UI (stateless)
// This now supports server-side PKCE: we generate code_verifier & code_challenge,
// store verifier server-side (pkceStore) keyed by state, and include code_challenge + state in the authorize URL.
router.get("/oauth/login", (req: Request, res: Response): void => {
  if (!COGNITO_ENABLED) {
    const redirectTo = process.env.POST_AUTH_REDIRECT || "/";
    res.redirect(`${redirectTo}?oauth_error=cognito_not_configured`);
    return;
  }

  // generate state and PKCE pair
  const state = typeof req.query.state === "string" && req.query.state ? req.query.state : makeState();
  // create code_verifier and code_challenge
  const { code_verifier, code_challenge } = makePkcePair();

  // store verifier keyed by state and auto-expire after 5 minutes
  try {
    pkceStore.set(state, code_verifier);
    setTimeout(() => pkceStore.delete(state), 5 * 60 * 1000); // 5 minutes TTL
  } catch (e) {
    // ignore store errors for now
    console.warn("PKCE store warning:", e);
  }

  // build authorize url with code_challenge and state
  const url = buildAuthorizeUrl({ state, code_challenge });
  res.redirect(url);
});

// OAuth callback (stateless) - exchange code for tokens and set secure cookies
router.get(
  "/oauth/callback",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const state = typeof req.query.state === "string" ? req.query.state : "";
      if (!code) {
        res.status(400).json({ success: false, message: "missing_code" });
        return;
      }

      // attempt to retrieve code_verifier from our in-memory pkceStore using state
      const code_verifier = state ? pkceStore.get(state) : undefined;
      // if found, delete immediately to avoid reuse
      if (state && code_verifier) pkceStore.delete(state);

      // Exchange code for tokens. Pass code_verifier only if we have one (PKCE path).
      const tokens: any = code_verifier
        ? await exchangeCodeForTokens(code, { code_verifier })
        : await exchangeCodeForTokens(code);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge:
          typeof tokens.expires_in === "number"
            ? tokens.expires_in * 1000
            : 3600 * 1000,
      };

      if (tokens.id_token) res.cookie("id_token", tokens.id_token, cookieOptions);
      if (tokens.access_token) res.cookie("access_token", tokens.access_token, cookieOptions);
      if (tokens.refresh_token)
        res.cookie("refresh_token", tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });

      const redirectTo = process.env.POST_AUTH_REDIRECT || "/";
      res.redirect(redirectTo);
      return;
    } catch (err: any) {
      console.error("OAuth callback error:", err?.body ?? err?.response ?? err?.message ?? err);
      // If callback fails, redirect to frontend with error query param
      const redirectTo = process.env.POST_AUTH_REDIRECT || "/";
      try {
        res.redirect(`${redirectTo}?oauth_error=1`);
        return;
      } catch (e) {
        return next(err);
      }
    }
  }
);

// Protected route - returns current user info via controller
router.get(
  "/me",
  authenticateToken,
  authController.getMe.bind(authController)
);

// Refresh tokens endpoint (stateless): exchange refresh token for new tokens and update cookies
router.post(
  "/refresh",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken =
        typeof req.cookies?.refresh_token === "string"
          ? req.cookies.refresh_token
          : typeof (req.body as any)?.refresh_token === "string"
          ? (req.body as any).refresh_token
          : typeof (req.body as any)?.refreshToken === "string"
          ? (req.body as any).refreshToken
          : "";

      if (!refreshToken) {
        res
          .status(400)
          .json({ success: false, message: "refresh_token_required" });
        return;
      }

      if (COGNITO_ENABLED) {
        const tokens: any = await refreshTokens(refreshToken);

        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          maxAge:
            typeof tokens.expires_in === "number"
              ? tokens.expires_in * 1000
              : 3600 * 1000,
        };

        if (tokens.id_token) res.cookie("id_token", tokens.id_token, cookieOptions);
        if (tokens.access_token) res.cookie("access_token", tokens.access_token, cookieOptions);
        if (tokens.refresh_token)
          res.cookie("refresh_token", tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          });

        res.json({ success: true });
        return;
      }

      try {
        const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
          res.status(401).json({ success: false, message: "User not found" });
          return;
        }
        const accessToken = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET as string,
          { expiresIn: "30m" }
        );
        res.json({ success: true, message: "Token refreshed successfully", data: { accessToken } });
        return;
      } catch (e) {
        res.status(500).json({ success: false, message: "refresh_failed", details: String(e) });
        return;
      }
    } catch (err: any) {
      console.error("Refresh token error:", err?.response ?? err?.message ?? err);
      res
        .status(500)
        .json({ success: false, message: "refresh_failed", details: String(err) });
      return;
    }
  }
);

// Logout: revoke refresh token (if available) and clear cookies
router.post(
  "/logout",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken =
        typeof req.cookies?.refresh_token === "string"
          ? req.cookies.refresh_token
          : typeof req.body?.refresh_token === "string"
          ? req.body.refresh_token
          : "";

      if (refreshToken) {
        try {
          await revokeToken(refreshToken);
        } catch (revErr) {
          console.warn("Failed to revoke token:", revErr);
        }
      }

      res.clearCookie("id_token");
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      res.json({ success: true });
      return;
    } catch (err: any) {
      console.error("Logout error:", err?.message ?? err);
      res.status(500).json({ success: false, message: "logout_failed" });
      return;
    }
  }
);

export default router;
