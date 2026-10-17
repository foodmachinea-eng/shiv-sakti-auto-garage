import { assertSameOrigin, handle, ok, parseId, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { categoryPatchSchema } from "@/lib/validation";
import { updateCategory } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const PATCH = handle(async (request: Request, ctx: RouteContext<"/api/admin/categories/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("services.manage");
  const patch = await readJson(request, categoryPatchSchema);
  const category = await updateCategory(parseId((await ctx.params).id), patch);
  return ok({ ok: true, category });
});
