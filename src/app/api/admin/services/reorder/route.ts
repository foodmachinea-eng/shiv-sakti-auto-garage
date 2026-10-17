import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { reorderSchema } from "@/lib/validation";
import { reorderServices } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("services.manage");
  const { ids } = await readJson(request, reorderSchema);
  await reorderServices(ids);
  return ok({ ok: true });
});
