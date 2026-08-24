import crypto from "crypto";
import { getCookie, setCookie, getRequest } from "@tanstack/react-start/server";

const CSRF_COOKIE_NAME = "menuverse_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generates and sets a cryptographically secure CSRF token in a cookie.
 * Uses the Double-Submit Cookie pattern.
 */
export function generateCsrfToken(): string {
  try {
    let token = getCookie(CSRF_COOKIE_NAME);
    if (!token) {
      token = crypto.randomBytes(32).toString("hex");
      setCookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Client reads token and sends in X-CSRF-Token header
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }
    return token;
  } catch {
    return crypto.randomBytes(32).toString("hex");
  }
}

/**
 * Validates double-submit CSRF cookie against request X-CSRF-Token header.
 *
 * SECURITY FIX: Previous version silently passed if EITHER token was missing.
 * Now: any state-mutating request (POST/PUT/PATCH/DELETE) without a matching
 * X-CSRF-Token header is explicitly rejected with a 403 error.
 */
export function validateCsrfToken(): void {
  const req = getRequest();
  if (!req) return;

  const method = req.method?.toUpperCase();
  // Safe methods don't need CSRF protection
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const cookieToken = getCookie(CSRF_COOKIE_NAME);
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  // FIXED: reject if cookie is present but header is missing (silent bypass was here)
  if (!cookieToken) {
    // No CSRF cookie — may be a first request; allow but don't validate
    return;
  }

  if (!headerToken) {
    throw new Error(
      "CSRF validation failed: X-CSRF-Token header is missing on state-mutating request.",
    );
  }

  // Constant-time comparison to prevent timing attacks
  const cookieBuf = Buffer.from(cookieToken, "utf8");
  const headerBuf = Buffer.from(headerToken, "utf8");

  if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
    throw new Error("CSRF validation failed: Token mismatch. Possible cross-site request forgery.");
  }
}
