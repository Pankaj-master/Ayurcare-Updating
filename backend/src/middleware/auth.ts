import { Request, Response, NextFunction, RequestHandler } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import jwt from "jsonwebtoken";
import { COGNITO_USER_POOL_ID, COGNITO_APP_CLIENT_ID, COGNITO_ENABLED } from "../utils/env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const accessVerifier = COGNITO_ENABLED
  ? CognitoJwtVerifier.create({
      userPoolId: COGNITO_USER_POOL_ID,
      clientId: COGNITO_APP_CLIENT_ID,
      tokenUse: "access",
    })
  : null;

const idVerifier = COGNITO_ENABLED
  ? CognitoJwtVerifier.create({
      userPoolId: COGNITO_USER_POOL_ID,
      clientId: COGNITO_APP_CLIENT_ID,
      tokenUse: "id",
    })
  : null;

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer "))
    return authHeader.split(" ")[1];

  if (req.cookies?.access_token) return req.cookies.access_token;
  if (req.cookies?.id_token) return req.cookies.id_token;

  return null;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    let decoded: any = null;

    if (COGNITO_ENABLED && accessVerifier && idVerifier) {
      try {
        decoded = await accessVerifier.verify(token);
      } catch {
        try {
          decoded = await idVerifier.verify(token);
        } catch {
          // fall through to local JWT verification
        }
      }
    }

    if (!decoded) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      } catch {
        res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
        return;
      }
    }

    const userEmail = decoded.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const authorizeRoles = (...roles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};
