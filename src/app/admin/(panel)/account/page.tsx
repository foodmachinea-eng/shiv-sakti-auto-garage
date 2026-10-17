import type { Metadata } from "next";
import { PageHeader, Panel } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/users/password-form";
import { requirePageUser } from "@/lib/auth/dal";
import { ROLES } from "@/lib/constants";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requirePageUser();
  const role = ROLES.find((r) => r.value === user.role);
  return (
    <>
      <PageHeader title="My account" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Profile">
          <dl className="space-y-3 text-[0.95rem]">
            <div>
              <dt className="text-[0.8rem] text-slate">Name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-[0.8rem] text-slate">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[0.8rem] text-slate">Role</dt>
              <dd className="font-medium">{role?.label}</dd>
              <dd className="text-[0.85rem] text-slate">{role?.description}</dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Change password" description="Changing your password signs you out on other devices.">
          <PasswordForm />
        </Panel>
      </div>
    </>
  );
}
