import { assertSameOrigin, handle, ok, parseId, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { galleryPatchSchema } from "@/lib/validation";
import { deleteGalleryItem, updateGalleryItem } from "@/lib/data/gallery";

export const dynamic = "force-dynamic";

export const PATCH = handle(async (request: Request, ctx: RouteContext<"/api/admin/gallery/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("gallery.manage");
  const patch = await readJson(request, galleryPatchSchema);
  const item = await updateGalleryItem(parseId((await ctx.params).id), patch);
  return ok({ ok: true, item });
});

export const DELETE = handle(async (request: Request, ctx: RouteContext<"/api/admin/gallery/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("gallery.manage");
  await deleteGalleryItem(parseId((await ctx.params).id));
  return ok({ ok: true });
});
