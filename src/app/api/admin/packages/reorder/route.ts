import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { reorderSchema } from "@/lib/validation";
import { reorderPackages } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("packages.manage");
  const { ids } = await readJson(request, reorderSchema);
  await reorderPackages(ids);
  return ok({ ok: true });
});
