import { assertSameOrigin, handle, isHttps, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { passwordChangeSchema } from "@/lib/validation";
import { changeOwnPassword } from "@/lib/data/users";
import { SESSION_TTL_SECONDS, setSessionCookie, signSession } from "@/lib/auth/session";
import type { Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Changes the signed-in user's password. Other devices are signed out; this one stays signed in. */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const user = await requireApiUser();
  const { currentPassword, newPassword } = await readJson(request, passwordChangeSchema);
  const updated = await changeOwnPassword(user.id, currentPassword, newPassword);
  const token = await signSession(
    { uid: updated.id, role: updated.role as Role, sv: updated.sessionVersion },
    SESSION_TTL_SECONDS,
  );
  await setSessionCookie(token, SESSION_TTL_SECONDS, isHttps(request));
  return ok({ ok: true });
});
