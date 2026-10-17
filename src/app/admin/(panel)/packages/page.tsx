import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { PackagesManager } from "@/components/admin/packages/packages-manager";
import { Forbidden } from "@/components/admin/forbidden";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { getPackages } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Packages" };

export default async function AdminPackagesPage() {
  const user = await requirePageUser();
  if (!can(user.role, "packages.manage")) return <Forbidden />;
  const [packages, settings] = await Promise.all([getPackages(true), getSettings()]);
  return (
    <>
      <PageHeader
        title="Service packages"
        description="Packages and prices shown on the pricing page. The price label and disclaimer are edited under Content & settings → Pricing."
      />
      <PackagesManager
        priceLabel={settings.pricing.priceLabel}
        packages={packages.map((p) => ({
          id: p.id,
          name: p.name,
          vehicleClass: p.vehicleClass,
          tagline: p.tagline,
          price: p.price,
          duration: p.duration,
          features: p.features,
          isPopular: p.isPopular,
          isActive: p.isActive,
        }))}
      />
    </>
  );
}
