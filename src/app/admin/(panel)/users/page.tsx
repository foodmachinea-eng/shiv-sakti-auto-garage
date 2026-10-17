import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { UsersManager } from "@/components/admin/users/users-manager";
import { Forbidden } from "@/components/admin/forbidden";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { listUsers } from "@/lib/data/users";

export const metadata: Metadata = { title: "Users & roles" };

export default async function UsersPage() {
  const user = await requirePageUser();
  if (!can(user.role, "users.manage")) return <Forbidden />;
  const users = await listUsers();
  return (
    <>
      <PageHeader title="Users & roles" description="Give staff their own sign-in. Staff can manage bookings and enquiries; admins can change everything." />
      <UsersManager
        currentUserId={user.id}
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive, lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null }))}
      />
    </>
  );
}
