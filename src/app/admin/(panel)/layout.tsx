import { AdminShell } from "@/components/admin/shell";
import { ConfirmProvider } from "@/components/admin/ui-client";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { countNewEnquiries, countPendingBookings } from "@/lib/data/bookings";
import { getSettings } from "@/lib/data/settings";
import { getDbMode } from "@/lib/db/client";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requirePageUser();
  const [pending, newEnquiries, settings] = await Promise.all([
    countPendingBookings(),
    countNewEnquiries(),
    getSettings(),
  ]);
  const permissions = PERMISSIONS.filter((p) => can(user.role, p));

  return (
    <ConfirmProvider>
      <AdminShell
        user={{ name: user.name, email: user.email, role: user.role }}
        permissions={permissions}
        counts={{ pending, newEnquiries }}
        garageName={settings.business.name}
        demoMode={getDbMode() === "demo"}
      >
        {children}
      </AdminShell>
    </ConfirmProvider>
  );
}
