import { assertSameOrigin, handle, ok, parseId, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { bookingUpdateSchema } from "@/lib/validation";
import { deleteBooking, updateBooking } from "@/lib/data/bookings";

export const dynamic = "force-dynamic";

export const PATCH = handle(async (request: Request, ctx: RouteContext<"/api/admin/bookings/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("bookings.update");
  const id = parseId((await ctx.params).id);
  const patch = await readJson(request, bookingUpdateSchema);
  const booking = await updateBooking(id, patch);
  return ok({ ok: true, booking });
});

export const DELETE = handle(async (request: Request, ctx: RouteContext<"/api/admin/bookings/[id]">) => {
  assertSameOrigin(request);
  await requireApiUser("bookings.delete");
  await deleteBooking(parseId((await ctx.params).id));
  return ok({ ok: true });
});
