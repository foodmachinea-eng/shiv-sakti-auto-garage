import { assertSameOrigin, handle, ok, parseId, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { enquiryUpdateSchema } from "@/lib/validation";
import { deleteEnquiry, updateEnquiryStatus } from "@/lib/data/bookings";

export const dynamic = "force-dynamic";

export const PATCH = handle(async (request: Request, ctx: RouteContext<"/api/admin/enquiries/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("enquiries.update");
  const { status } = await readJson(request, enquiryUpdateSchema);
  const enquiry = await updateEnquiryStatus(parseId((await ctx.params).id), status);
  return ok({ ok: true, enquiry });
});

export const DELETE = handle(async (request: Request, ctx: RouteContext<"/api/admin/enquiries/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("enquiries.delete");
  await deleteEnquiry(parseId((await ctx.params).id));
  return ok({ ok: true });
});
