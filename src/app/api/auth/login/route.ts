import { ApiError, assertSameOrigin, handle, isHttps, ok, readJson } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { findUserForLogin, recordLogin } from "@/lib/data/users";
import { getDummyHash, verifyPassword } from "@/lib/auth/password";
import {
  REMEMBER_TTL_SECONDS,
  SESSION_TTL_SECONDS,
  setSessionCookie,
  signSession,
} from "@/lib/auth/session";
import { clearRateLimit, enforceRateLimit, getClientIp, hashIp } from "@/lib/rate-limit";
import type { Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const { email, password, remember } = await readJson(request, loginSchema, 5_000);

  const ipKey = hashIp(getClientIp(request));
  const tooMany = "Too many sign-in attempts. Wait 15 minutes and try again.";
  await enforceRateLimit("login-ip", ipKey, 20, 15 * 60, tooMany);
  await enforceRateLimit("login-email", email, 8, 15 * 60, tooMany);

  const user = await findUserForLogin(email);
  // Always run a full hash check so response time doesn't reveal which emails exist.
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid || !user.isActive) {
    throw new ApiError(401, "Incorrect email or password.");
  }

  await clearRateLimit("login-email", email);
  const ttl = remember ? REMEMBER_TTL_SECONDS : SESSION_TTL_SECONDS;
  const token = await signSession({ uid: user.id, role: user.role as Role, sv: user.sessionVersion }, ttl);
  await setSessionCookie(token, ttl, isHttps(request));
  await recordLogin(user.id);
  return ok({ ok: true, user: { name: user.name, role: user.role } });
});
