import { assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { userCreateSchema } from "@/lib/validation";
import { createUser, listUsers } from "@/lib/data/users";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireApiUser("users.manage");
  return ok({ users: await listUsers() });
});

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await requireApiUser("users.manage");
  const input = await readJson(request, userCreateSchema);
  const user = await createUser(input);
  return ok({ ok: true, user }, { status: 201 });
});
