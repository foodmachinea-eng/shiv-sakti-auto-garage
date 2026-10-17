import { z } from "zod";

/**
 * Validation + types for the editable website content stored in the
 * `site_settings` table. Shared by the admin forms (client) and API (server).
 */

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time, e.g. 09:00");

const text = (max: number) => z.string().trim().max(max);
const required = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max);

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), {
    message: "Enter a full link starting with https:// or a /media/... path",
  });

export const ICON_KEYS = [
  "wrench",
  "engine",
  "oil",
  "brake",
  "gearbox",
  "suspension",
  "battery",
  "ac",
  "electrical",
  "tyre",
  "wash",
  "chain",
  "scooter",
  "motorbike",
  "car",
  "auto",
  "truck",
  "diagnosis",
  "inspection",
  "shield",
  "rupee",
  "clock",
  "users",
  "thumbs-up",
  "parts",
  "gauge",
  "spark",
  "fuel",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];
export const iconKey = z.enum(ICON_KEYS);

export const dayHoursSchema = z
  .object({
    day: z.number().int().min(0).max(6),
    open: time,
    close: time,
    closed: z.boolean(),
  })
  .refine((h) => h.closed || h.open < h.close, {
    message: "Closing time must be after opening time",
    path: ["close"],
  });
export type DayHours = z.infer<typeof dayHoursSchema>;

export const businessSchema = z.object({
  name: required("Garage name", 80),
  tagline: text(140),
  ownerName: text(80),
  ownerRole: text(80),
  yearsExperience: z.coerce.number().int().min(0).max(100),
  phone: required("Phone number", 30),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Digits only with country code, e.g. 919876543210"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  addressLine1: required("Address", 120),
  addressLine2: text(120),
  city: required("City", 60),
  state: text(60),
  pincode: text(12),
  mapQuery: text(200),
  mapEmbedUrl: optionalUrl,
  googleReviewUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  hours: z.array(dayHoursSchema).length(7),
  slotMinutes: z.coerce.number().int().refine((v) => [30, 60, 90, 120].includes(v), {
    message: "Choose 30, 60, 90 or 120 minutes",
  }),
  bookingWindowDays: z.coerce.number().int().min(1).max(120),
});
export type BusinessSettings = z.infer<typeof businessSchema>;

const titledItem = z.object({
  icon: iconKey,
  title: required("Title", 60),
  text: text(220),
});
export type TitledItem = z.infer<typeof titledItem>;

const imageRef = z.object({ url: optionalUrl, alt: text(160) });

export const homeSchema = z.object({
  heroTitle: required("Headline", 90),
  heroSubtitle: required("Description", 220),
  heroImage: optionalUrl,
  heroImageAlt: text(160),
  highlights: z.array(z.object({ title: required("Title", 40), text: text(80) })).max(4),
  whyTitle: required("Section title", 80),
  whyIntro: text(400),
  whyItems: z.array(titledItem).min(1).max(8),
  processTitle: required("Section title", 80),
  processSteps: z.array(z.object({ title: required("Title", 60), text: text(200) })).min(2).max(6),
  workshopTitle: required("Section title", 80),
  workshopText: text(700),
  workshopPoints: z.array(text(80)).max(6),
  workshopImages: z.array(imageRef).max(4),
  ctaTitle: required("Title", 80),
  ctaText: text(200),
});
export type HomeSettings = z.infer<typeof homeSchema>;

export const aboutSchema = z.object({
  title: required("Title", 80),
  intro: text(300),
  story: text(3000),
  image: optionalUrl,
  imageAlt: text(160),
  commitments: z.array(titledItem).min(1).max(8),
  ownerMessage: text(600),
  ownerPhoto: optionalUrl,
});
export type AboutSettings = z.infer<typeof aboutSchema>;

export const pricingSchema = z.object({
  intro: text(400),
  priceLabel: required("Price label", 40),
  disclaimer: required("Disclaimer", 500),
  faqs: z.array(z.object({ q: required("Question", 160), a: required("Answer", 800) })).max(10),
});
export type PricingSettings = z.infer<typeof pricingSchema>;

export const ACCENTS = {
  red: { label: "Racing red", base: "#D90A0A", strong: "#B30707", bright: "#FF3B30" },
  orange: { label: "Signal orange", base: "#C84B0C", strong: "#A63D08", bright: "#FF7A1A" },
} as const;
export type AccentKey = keyof typeof ACCENTS;

export const brandingSchema = z.object({
  accent: z.enum(["red", "orange"]),
  logoUrl: optionalUrl,
  showDemoNotice: z.boolean(),
  demoNoticeText: text(200),
  seoTitle: text(70),
  seoDescription: text(170),
});
export type BrandingSettings = z.infer<typeof brandingSchema>;

export const settingsSchemas = {
  business: businessSchema,
  home: homeSchema,
  about: aboutSchema,
  pricing: pricingSchema,
  branding: brandingSchema,
} as const;

export type SettingsKey = keyof typeof settingsSchemas;
export const SETTINGS_KEYS = Object.keys(settingsSchemas) as SettingsKey[];

export type SiteSettings = {
  business: BusinessSettings;
  home: HomeSettings;
  about: AboutSettings;
  pricing: PricingSettings;
  branding: BrandingSettings;
};
