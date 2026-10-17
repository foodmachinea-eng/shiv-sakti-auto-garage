import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { testimonialSchema } from "@/lib/validation";
import { createTestimonial } from "@/lib/data/gallery";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("reviews.manage");
  const input = await readJson(request, testimonialSchema);
  const review = await createTestimonial(input);
  return ok({ ok: true, review }, { status: 201 });
});
