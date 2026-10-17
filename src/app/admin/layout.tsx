import type { Metadata } from "next";
import { BrandStyle } from "@/components/brand-style";
import { getSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  const settings = await getSettings();
  return (
    <div className="min-h-screen bg-paper text-charcoal">
      <BrandStyle accent={settings.branding.accent} />
      {children}
    </div>
  );
}
