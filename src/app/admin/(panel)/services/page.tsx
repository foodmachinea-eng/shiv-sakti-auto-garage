import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { ServicesManager } from "@/components/admin/services/services-manager";
import { Forbidden } from "@/components/admin/forbidden";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { getCatalog, serviceUsageCounts } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "Services & prices" };

export default async function AdminServicesPage() {
  const user = await requirePageUser();
  if (!can(user.role, "services.manage")) return <Forbidden />;
  const [catalog, usage] = await Promise.all([getCatalog(true), serviceUsageCounts()]);
  return (
    <>
      <PageHeader
        title="Services & prices"
        description="Add, edit or hide services. Click a price to change it; it saves when you leave the field. Prices are shown on the website as estimates."
      />
      <ServicesManager
        categories={catalog.map((c) => ({
          id: c.id,
          name: c.name,
          shortName: c.shortName,
          description: c.description,
          imageUrl: c.imageUrl,
          services: c.services.map((s) => ({
            id: s.id,
            categoryId: s.categoryId,
            name: s.name,
            description: s.description,
            icon: s.icon,
            priceFrom: s.priceFrom,
            priceNote: s.priceNote,
            duration: s.duration,
            isFeatured: s.isFeatured,
            isActive: s.isActive,
            bookings: usage[s.id] ?? 0,
          })),
        }))}
      />
    </>
  );
}
