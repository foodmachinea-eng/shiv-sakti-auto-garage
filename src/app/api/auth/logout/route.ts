import { assertSameOrigin, handle, ok } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await clearSessionCookie();
  return ok({ ok: true });
});
