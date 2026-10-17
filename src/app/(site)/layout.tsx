import type { Metadata } from "next";
import { Header } from "@/components/site/header";
import { BrandStyle } from "@/components/brand-style";
import { Footer } from "@/components/site/footer";
import { FloatingActions } from "@/components/site/floating-actions";
import { getSettings } from "@/lib/data/settings";
import { getCatalog } from "@/lib/data/catalog";
import { businessInfo } from "@/lib/site";

// Content is edited live from the admin panel, so pages render on each request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const b = settings.business;
  const title = settings.branding.seoTitle || `${b.name} | Car, Bike & Auto Repair in ${b.city}`;
  const description =
    settings.branding.seoDescription ||
    `${b.name} in ${b.city}: servicing and repairs for cars, bikes, scooters, auto-rickshaws and commercial vehicles. Book a service online or call ${b.phone}.`;
  return {
    title: { default: title, template: `%s | ${b.name}` },
    description,
    applicationName: b.name,
    openGraph: {
      type: "website",
      siteName: b.name,
      title,
      description,
      locale: "en_IN",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: b.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, catalog] = await Promise.all([getSettings(), getCatalog()]);
  const business = businessInfo(settings);
  return (
    <>
      <BrandStyle accent={settings.branding.accent} />
      <a
        href="#main"
        className="sr-only z-[60] rounded-sm bg-white px-4 py-2 font-medium text-charcoal focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header business={business} />
      <main id="main">{children}</main>
      <Footer
        business={business}
        categories={catalog.map((c) => ({ slug: c.slug, name: c.name }))}
        demoNotice={settings.branding.showDemoNotice ? settings.branding.demoNoticeText : null}
      />
      <FloatingActions business={business} />
    </>
  );
}
