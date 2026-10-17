import type { SiteSettings } from "@/content/settings-schema";
import { fillTokens, telHref, whatsappHref } from "./format";

/** Public site URL for metadata, sitemap and structured data. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Business details in the shape most components need (safe to pass to client components). */
export type BusinessInfo = {
  name: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  email: string;
  address: string;
  addressLines: string[];
  city: string;
  mapQuery: string;
  mapEmbedUrl: string;
  directionsUrl: string;
  hours: SiteSettings["business"]["hours"];
  slotMinutes: number;
  bookingWindowDays: number;
  logoUrl: string;
  years: number;
  social: { label: string; href: string }[];
};

export function businessInfo(settings: SiteSettings): BusinessInfo {
  const b = settings.business;
  const addressLines = [
    b.addressLine1,
    b.addressLine2,
    [b.city, b.state].filter(Boolean).join(", ") + (b.pincode ? ` ${b.pincode}` : ""),
  ].filter((l) => l && l.trim());
  const mapQuery = b.mapQuery || addressLines.join(", ");
  const greeting = `Hi ${b.name}, I'd like to enquire about a vehicle service.`;
  return {
    name: b.name,
    tagline: b.tagline,
    phone: b.phone,
    phoneHref: telHref(b.phone),
    whatsapp: b.whatsapp,
    whatsappHref: whatsappHref(b.whatsapp, greeting),
    email: b.email,
    address: addressLines.join(", "),
    addressLines,
    city: b.city,
    mapQuery,
    mapEmbedUrl:
      b.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`,
    hours: b.hours,
    slotMinutes: b.slotMinutes,
    bookingWindowDays: b.bookingWindowDays,
    logoUrl: settings.branding.logoUrl,
    years: b.yearsExperience,
    social: [
      { label: "Instagram", href: b.instagramUrl },
      { label: "Facebook", href: b.facebookUrl },
      { label: "YouTube", href: b.youtubeUrl },
    ].filter((s) => s.href),
  };
}

export function tokensFor(settings: SiteSettings) {
  return { name: settings.business.name, years: settings.business.yearsExperience };
}

export function fill(settings: SiteSettings, text: string) {
  return fillTokens(text, tokensFor(settings));
}
