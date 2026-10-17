import { assertSameOrigin, handle, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { clearSampleData } from "@/lib/data/bookings";

export const dynamic = "force-dynamic";

/** Deletes the demo bookings and enquiries before going live. */
export const DELETE = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("content.manage");
  const removed = await clearSampleData();
  return ok({ ok: true, removed });
});
