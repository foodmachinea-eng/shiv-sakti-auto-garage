import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getDbMode } from "@/lib/db/client";
import { ROLE_VALUES, type Role } from "@/lib/constants";

export const SESSION_COOKIE = "garage_admin_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours
export const REMEMBER_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export type SessionClaims = { uid: number; role: Role; sv: number };

export class AuthConfigError extends Error {}

let warnedShortSecret = false;

/**
 * The session signing key. AUTH_SECRET is required whenever a real database is
 * connected. In demo mode (no DATABASE_URL) a per-installation key is derived
 * so the local demo works without any configuration.
 */
export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret) {
    if (secret.length < 32 && !warnedShortSecret) {
      warnedShortSecret = true;
      console.warn("[auth] AUTH_SECRET should be at least 32 characters. Generate one with: openssl rand -base64 32");
    }
    return new TextEncoder().encode(secret);
  }
  if (getDbMode() === "demo") {
    return createHash("sha256").update(`garage-demo-only:${process.cwd()}`).digest();
  }
  throw new AuthConfigError(
    "AUTH_SECRET is not set. Add a long random value (openssl rand -base64 32) to your environment variables.",
  );
}

export async function signSession(claims: SessionClaims, ttlSeconds: number): Promise<string> {
  return new SignJWT({ role: claims.role, sv: claims.sv })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(claims.uid))
    .setIssuedAt()
    .setIssuer("garage-admin")
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(getAuthSecret());
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      algorithms: ["HS256"],
      issuer: "garage-admin",
    });
    const uid = Number(payload.sub);
    const role = payload.role as Role;
    const sv = Number(payload.sv);
    if (!Number.isInteger(uid) || !ROLE_VALUES.includes(role) || !Number.isInteger(sv)) return null;
    return { uid, role, sv };
  } catch (error) {
    if (error instanceof AuthConfigError) throw error;
    return null;
  }
}

export async function getSessionClaims(): Promise<SessionClaims | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(token: string, ttlSeconds: number, secure: boolean) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ttlSeconds,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}
