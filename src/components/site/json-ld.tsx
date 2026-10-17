import type { SiteSettings } from "@/content/settings-schema";
import { businessInfo, getSiteUrl } from "@/lib/site";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** schema.org AutoRepair data so search engines can show the garage's address, phone and hours. */
export function BusinessJsonLd({ settings }: { settings: SiteSettings }) {
  const b = settings.business;
  const info = businessInfo(settings);
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: b.name,
    description: b.tagline,
    url,
    telephone: b.phone,
    email: b.email || undefined,
    image: `${url}/og-image.png`,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: [b.addressLine1, b.addressLine2].filter(Boolean).join(", "),
      addressLocality: b.city,
      addressRegion: b.state,
      postalCode: b.pincode,
      addressCountry: "IN",
    },
    hasMap: info.directionsUrl,
    openingHoursSpecification: b.hours
      .filter((h) => !h.closed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAMES[h.day],
        opens: h.open,
        closes: h.close,
      })),
    sameAs: info.social.map((s) => s.href),
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped is safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
