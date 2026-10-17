import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { serviceSchema } from "@/lib/validation";
import { createService } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("services.manage");
  const input = await readJson(request, serviceSchema);
  const service = await createService(input);
  return ok({ ok: true, service }, { status: 201 });
});
