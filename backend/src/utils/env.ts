// backend/src/utils/env.ts
// Central place to read and normalise environment variables.
// Safe to call multiple times; it will only call dotenv once in dev.
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

function trimOrEmpty(v?: string | null) {
  return (v || "").trim();
}

export const NODE_ENV = trimOrEmpty(process.env.NODE_ENV) || "development";
export const PORT = Number(process.env.PORT || 5001);

// Cognito flags / values
export const COGNITO_USER_POOL_ID = trimOrEmpty(process.env.COGNITO_USER_POOL_ID);
export const COGNITO_APP_CLIENT_ID = trimOrEmpty(process.env.COGNITO_APP_CLIENT_ID);
export const COGNITO_APP_CLIENT_SECRET = trimOrEmpty(process.env.COGNITO_APP_CLIENT_SECRET);
export const COGNITO_DOMAIN = trimOrEmpty(process.env.COGNITO_DOMAIN); // e.g. myapp.auth.eu-north-1.amazoncognito.com
export const COGNITO_REGION = trimOrEmpty(process.env.COGNITO_REGION) || "eu-north-1";
export const COGNITO_REDIRECT_URI = trimOrEmpty(process.env.COGNITO_REDIRECT_URI);

// A boolean flag you can use across the app
export const COGNITO_ENABLED = Boolean(COGNITO_DOMAIN && COGNITO_APP_CLIENT_ID);

// Frontend / redirect settings
export const FRONTEND_URL = trimOrEmpty(process.env.FRONTEND_URL) || "http://localhost:4000";
export const POST_AUTH_REDIRECT = trimOrEmpty(process.env.POST_AUTH_REDIRECT) || FRONTEND_URL;
export const POST_LOGOUT_REDIRECT = trimOrEmpty(process.env.POST_LOGOUT_REDIRECT) || FRONTEND_URL;

// JWT (fallback / legacy)
export const JWT_SECRET = trimOrEmpty(process.env.JWT_SECRET);
export const JWT_REFRESH_SECRET = trimOrEmpty(process.env.JWT_REFRESH_SECRET);

// Other exports you may need
export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE || 5242880);
export const UPLOAD_PATH = trimOrEmpty(process.env.UPLOAD_PATH) || "uploads/";

// Helper to expose whether we are in production
export const IS_PRODUCTION = NODE_ENV === "production";
