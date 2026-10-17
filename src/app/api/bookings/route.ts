import { handle, ok, assertSameOrigin, readJson } from "@/lib/api";
import { bookingSchema } from "@/lib/validation";
import { createBooking } from "@/lib/data/bookings";
import { enforceRateLimit, getClientIp, hashIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Public: a customer books a service. */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const input = await readJson(request, bookingSchema, 20_000);

  // Bots fill the hidden "website" field — pretend everything worked.
  if (input.website) return ok({ ok: true, booking: null }, { status: 201 });

  const ipHash = hashIp(getClientIp(request));
  await enforceRateLimit(
    "booking",
    ipHash,
    8,
    10 * 60,
    "Too many booking requests from this connection. Please call or WhatsApp us instead.",
  );

  const booking = await createBooking(input, ipHash);
  return ok(
    {
      ok: true,
      booking: {
        reference: booking.reference,
        customerName: booking.customerName,
        mobile: booking.mobile,
        vehicleType: booking.vehicleType,
        vehicleMake: booking.vehicleMake,
        vehicleModel: booking.vehicleModel,
        registrationNumber: booking.registrationNumber,
        serviceName: booking.serviceName,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
      },
    },
    { status: 201 },
  );
});
