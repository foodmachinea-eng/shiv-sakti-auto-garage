import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { ApiError } from "@/lib/api";
import type { Role } from "@/lib/constants";
import { can, type Permission } from "./permissions";
import { getSessionClaims } from "./session";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  sessionVersion: number;
};

/**
 * Data Access Layer: the single place that decides who is signed in.
 * Verifies the signed session cookie AND re-checks the user in the database
 * (still active, same session version), so revoked sessions stop working
 * immediately. Cached per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const claims = await getSessionClaims();
  if (!claims) return null;
  const db = await getDb();
  const [user] = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      sessionVersion: adminUsers.sessionVersion,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, claims.uid))
    .limit(1);
  if (!user || !user.isActive || user.sessionVersion !== claims.sv) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    sessionVersion: user.sessionVersion,
  };
});

/** For admin pages: redirects to the login page when signed out. */
export async function requirePageUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** For admin API routes: 401 when signed out, 403 without the permission. */
export async function requireApiUser(permission?: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Your session has ended. Please sign in again.");
  if (permission && !can(user.role, permission)) {
    throw new ApiError(403, "Your account doesn't have permission to do this.");
  }
  return user;
}
