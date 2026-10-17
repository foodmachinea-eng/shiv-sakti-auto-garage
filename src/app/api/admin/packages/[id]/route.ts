import { assertSameOrigin, handle, ok, parseId, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { packagePatchSchema } from "@/lib/validation";
import { deletePackage, updatePackage } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const PATCH = handle(async (request: Request, ctx: RouteContext<"/api/admin/packages/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("packages.manage");
  const patch = await readJson(request, packagePatchSchema);
  const pkg = await updatePackage(parseId((await ctx.params).id), patch);
  return ok({ ok: true, package: pkg });
});

export const DELETE = handle(async (request: Request, ctx: RouteContext<"/api/admin/packages/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("packages.manage");
  await deletePackage(parseId((await ctx.params).id));
  return ok({ ok: true });
});
