import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { reorderSchema } from "@/lib/validation";
import { reorderGallery } from "@/lib/data/gallery";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("gallery.manage");
  const { ids } = await readJson(request, reorderSchema);
  await reorderGallery(ids);
  return ok({ ok: true });
});
