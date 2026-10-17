import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { packageSchema } from "@/lib/validation";
import { createPackage } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("packages.manage");
  const input = await readJson(request, packageSchema);
  const pkg = await createPackage(input);
  return ok({ ok: true, package: pkg }, { status: 201 });
});
