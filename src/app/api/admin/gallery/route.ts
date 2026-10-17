import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { galleryItemSchema } from "@/lib/validation";
import { createGalleryItem } from "@/lib/data/gallery";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("gallery.manage");
  const input = await readJson(request, galleryItemSchema);
  const item = await createGalleryItem(input);
  return ok({ ok: true, item }, { status: 201 });
});
