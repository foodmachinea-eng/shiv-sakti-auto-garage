import "server-only";
import { and, asc, count, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { ApiError } from "@/lib/api";
import { checkPasswordStrength, hashPassword, verifyPassword } from "@/lib/auth/password";
import type { Role } from "@/lib/constants";

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

const publicColumns = {
  id: adminUsers.id,
  name: adminUsers.name,
  email: adminUsers.email,
  role: adminUsers.role,
  isActive: adminUsers.isActive,
  lastLoginAt: adminUsers.lastLoginAt,
  createdAt: adminUsers.createdAt,
};

export async function listUsers(): Promise<PublicUser[]> {
  const db = await getDb();
  const rows = await db.select(publicColumns).from(adminUsers).orderBy(asc(adminUsers.id));
  return rows.map((r) => ({ ...r, role: r.role as Role }));
}

export async function countAdmins(): Promise<number> {
  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(adminUsers);
  return Number(n);
}

export async function findUserForLogin(email: string) {
  const db = await getDb();
  const [row] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase())).limit(1);
  return row ?? null;
}

export async function recordLogin(id: number) {
  const db = await getDb();
  await db.update(adminUsers).set({ lastLoginAt: sql`now()` }).where(eq(adminUsers.id, id));
}

function assertStrong(password: string, field = "password") {
  const problem = checkPasswordStrength(password);
  if (problem) throw new ApiError(422, problem, { [field]: problem });
}

export async function createUser(input: { name: string; email: string; role: Role; password: string }) {
  assertStrong(input.password);
  const db = await getDb();
  const existing = await findUserForLogin(input.email);
  if (existing) throw new ApiError(409, "An account with this email already exists.", { email: "This email is already in use" });
  const [row] = await db
    .insert(adminUsers)
    .values({ name: input.name, email: input.email.toLowerCase(), role: input.role, passwordHash: await hashPassword(input.password) })
    .returning(publicColumns);
  return row;
}

/** Keeps at least one active admin so nobody can lock the garage out of its own panel. */
async function assertOtherActiveAdmin(excludingId: number) {
  const db = await getDb();
  const [{ n }] = await db
    .select({ n: count() })
    .from(adminUsers)
    .where(and(eq(adminUsers.role, "admin"), eq(adminUsers.isActive, true), ne(adminUsers.id, excludingId)));
  if (Number(n) === 0) throw new ApiError(409, "Keep at least one active admin account.");
}

export async function updateUser(
  actorId: number,
  id: number,
  input: { name?: string; role?: Role; isActive?: boolean; password?: string },
) {
  const db = await getDb();
  const [current] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!current) throw new ApiError(404, "That account no longer exists.");

  const demotingAdmin = current.role === "admin" && input.role && input.role !== "admin";
  const deactivatingAdmin = current.role === "admin" && input.isActive === false;
  if (demotingAdmin || deactivatingAdmin) await assertOtherActiveAdmin(id);
  if (id === actorId && input.isActive === false) throw new ApiError(409, "You can't deactivate your own account.");

  const set: Partial<typeof adminUsers.$inferInsert> = { updatedAt: new Date() };
  if (input.name) set.name = input.name;
  if (input.role) set.role = input.role;
  if (typeof input.isActive === "boolean") set.isActive = input.isActive;
  if (input.password) {
    assertStrong(input.password);
    set.passwordHash = await hashPassword(input.password);
  }
  // Changing role, status or password signs the user out everywhere (a name-only edit doesn't).
  const roleChanged = !!input.role && input.role !== current.role;
  const statusChanged = typeof input.isActive === "boolean" && input.isActive !== current.isActive;
  if (roleChanged || statusChanged || input.password) {
    set.sessionVersion = current.sessionVersion + 1;
  }
  const [row] = await db.update(adminUsers).set(set).where(eq(adminUsers.id, id)).returning(publicColumns);
  return row;
}

export async function deleteUser(actorId: number, id: number) {
  if (id === actorId) throw new ApiError(409, "You can't delete your own account.");
  const db = await getDb();
  const [current] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!current) throw new ApiError(404, "That account no longer exists.");
  if (current.role === "admin") await assertOtherActiveAdmin(id);
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}

export async function changeOwnPassword(id: number, currentPassword: string, newPassword: string) {
  const db = await getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!user) throw new ApiError(404, "Account not found.");
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new ApiError(422, "Your current password is incorrect.", { currentPassword: "Incorrect password" });
  }
  assertStrong(newPassword, "newPassword");
  if (currentPassword === newPassword) {
    throw new ApiError(422, "Choose a new password that's different from the current one.", {
      newPassword: "Use a different password",
    });
  }
  const [row] = await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(newPassword), sessionVersion: user.sessionVersion + 1, updatedAt: sql`now()` })
    .where(eq(adminUsers.id, id))
    .returning({ id: adminUsers.id, role: adminUsers.role, sessionVersion: adminUsers.sessionVersion });
  return row;
}
