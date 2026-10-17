import { assertSameOrigin, handle, ok, parseId, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { servicePatchSchema } from "@/lib/validation";
import { deleteService, updateService } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const PATCH = handle(async (request: Request, ctx: RouteContext<"/api/admin/services/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("services.manage");
  const patch = await readJson(request, servicePatchSchema);
  const service = await updateService(parseId((await ctx.params).id), patch);
  return ok({ ok: true, service });
});

export const DELETE = handle(async (request: Request, ctx: RouteContext<"/api/admin/services/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("services.manage");
  await deleteService(parseId((await ctx.params).id));
  return ok({ ok: true });
});
