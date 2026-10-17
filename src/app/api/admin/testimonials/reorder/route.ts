import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { reorderSchema } from "@/lib/validation";
import { reorderTestimonials } from "@/lib/data/gallery";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("reviews.manage");
  const { ids } = await readJson(request, reorderSchema);
  await reorderTestimonials(ids);
  return ok({ ok: true });
});
