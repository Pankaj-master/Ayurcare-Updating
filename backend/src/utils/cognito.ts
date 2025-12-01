import axios from "axios";
import { COGNITO_DOMAIN, COGNITO_APP_CLIENT_ID, COGNITO_APP_CLIENT_SECRET, COGNITO_REDIRECT_URI } from "./env";

type TokenResponse = {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

function cleanDomain(d: string) {
  return d.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

const DOMAIN = cleanDomain(COGNITO_DOMAIN);
const TOKEN_URL = `https://${DOMAIN}/oauth2/token`;
const AUTHORIZE_URL = `https://${DOMAIN}/oauth2/authorize`;
const REVOKE_URL = `https://${DOMAIN}/oauth2/revoke`;

async function postForm<T = any>(url: string, body: URLSearchParams, headers: Record<string, string> = {}): Promise<T> {
  const res = await axios.post(url, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
    timeout: 15000,
    validateStatus: () => true,
  });
  if (res.status >= 400) {
    const data = res.data || {};
    const desc = typeof data === "object" && (data.error_description || data.error) ? (data.error_description || data.error) : JSON.stringify(data);
    const err: any = new Error(desc);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return res.data as T;
}

function authHeadersIfSecret(): Record<string, string> {
  if (COGNITO_APP_CLIENT_SECRET && COGNITO_APP_CLIENT_SECRET.length) {
    const basic = Buffer.from(`${COGNITO_APP_CLIENT_ID}:${COGNITO_APP_CLIENT_SECRET}`).toString("base64");
    return { Authorization: `Basic ${basic}` };
  }
  return {};
}

export async function exchangeCodeForTokens(code: string, opts?: { code_verifier?: string }): Promise<TokenResponse> {
  if (!code) throw new Error("missing_code");
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", COGNITO_REDIRECT_URI);
  if (!COGNITO_APP_CLIENT_SECRET || !COGNITO_APP_CLIENT_SECRET.length) body.set("client_id", COGNITO_APP_CLIENT_ID);
  if (opts?.code_verifier) body.set("code_verifier", opts.code_verifier);
  return await postForm<TokenResponse>(TOKEN_URL, body, authHeadersIfSecret());
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  if (!refreshToken) throw new Error("missing_refresh_token");
  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", refreshToken);
  if (!COGNITO_APP_CLIENT_SECRET || !COGNITO_APP_CLIENT_SECRET.length) body.set("client_id", COGNITO_APP_CLIENT_ID);
  return await postForm<TokenResponse>(TOKEN_URL, body, authHeadersIfSecret());
}

export async function revokeToken(token: string): Promise<void> {
  if (!token) throw new Error("missing_token");
  const body = new URLSearchParams();
  body.set("token", token);
  if (!COGNITO_APP_CLIENT_SECRET || !COGNITO_APP_CLIENT_SECRET.length) body.set("client_id", COGNITO_APP_CLIENT_ID);
  await postForm(REVOKE_URL, body, authHeadersIfSecret());
}

export function buildAuthorizeUrl(options?: { state?: string; identity_provider?: string; prompt?: string; code_challenge?: string }) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: COGNITO_APP_CLIENT_ID,
    redirect_uri: COGNITO_REDIRECT_URI,
    scope: "openid profile email",
  });
  if (options?.state) params.set("state", options.state);
  if (options?.identity_provider) params.set("identity_provider", options.identity_provider);
  if (options?.prompt) params.set("prompt", options.prompt);
  if (options?.code_challenge) {
    params.set("code_challenge_method", "S256");
    params.set("code_challenge", options.code_challenge);
  }
  return `${AUTHORIZE_URL}?${params.toString()}`;
}