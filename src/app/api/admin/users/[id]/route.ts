import { assertSameOrigin, handle, ok, parseId, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { userUpdateSchema } from "@/lib/validation";
import { deleteUser, updateUser } from "@/lib/data/users";

export const dynamic = "force-dynamic";

export const PATCH = handle(async (request: Request, ctx: RouteContext<"/api/admin/users/[id]">) => {
  assertSameOrigin(request);
  const actor = await requireApiUser("users.manage");
  const patch = await readJson(request, userUpdateSchema);
  const user = await updateUser(actor.id, parseId((await ctx.params).id), patch);
  return ok({ ok: true, user });
});

export const DELETE = handle(async (request: Request, ctx: RouteContext<"/api/admin/users/[id]">) => {
  assertSameOrigin(request);
  const actor = await requireApiUser("users.manage");
  await deleteUser(actor.id, parseId((await ctx.params).id));
  return ok({ ok: true });
});
