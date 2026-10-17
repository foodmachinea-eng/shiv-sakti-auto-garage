import { handle, ok, assertSameOrigin, readJson } from "@/lib/api";
import { enquirySchema } from "@/lib/validation";
import { createEnquiry } from "@/lib/data/bookings";
import { enforceRateLimit, getClientIp, hashIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Public: contact-page enquiry form. */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const input = await readJson(request, enquirySchema, 20_000);
  if (input.website) return ok({ ok: true }, { status: 201 });

  const ipHash = hashIp(getClientIp(request));
  await enforceRateLimit(
    "enquiry",
    ipHash,
    6,
    10 * 60,
    "Too many messages from this connection. Please call or WhatsApp us instead.",
  );
  const enquiry = await createEnquiry(input, ipHash);
  return ok({ ok: true, id: enquiry.id }, { status: 201 });
});
