import { z } from "zod";
import {
  BOOKING_STATUS_VALUES,
  ENQUIRY_STATUS_VALUES,
  GALLERY_CATEGORY_VALUES,
  PACKAGE_CLASS_VALUES,
  ROLE_VALUES,
  VEHICLE_TYPE_VALUES,
} from "./constants";
import { ICON_KEYS } from "@/content/settings-schema";
import { compactRegistration, normalizeIndianMobile } from "./format";

/**
 * Validation rules shared by the browser forms and the API routes, so the
 * customer sees the same messages the server would return.
 */

const name = z
  .string()
  .trim()
  .min(2, "Enter your name")
  .max(80, "Name is too long");

export const mobileField = z
  .string()
  .trim()
  .min(1, "Enter your mobile number")
  .refine((v) => normalizeIndianMobile(v) !== null, "Enter a valid 10-digit Indian mobile number");

const registration = z
  .string()
  .trim()
  .min(1, "Enter the registration number")
  .refine((v) => {
    const c = compactRegistration(v);
    return c.length >= 6 && c.length <= 12;
  }, "Enter a valid registration number, e.g. MH 12 AB 1234");

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");
const hm = z.string().regex(/^\d{2}:\d{2}$/, "Choose a time slot");

/** The service field holds "service:<id>", "package:<id>" or "inspection". */
export const serviceChoice = z
  .string()
  .regex(/^(service:\d+|package:\d+|inspection)$/, "Choose the service you need");

export const bookingSchema = z.object({
  customerName: name,
  mobile: mobileField,
  vehicleType: z.enum(VEHICLE_TYPE_VALUES, { message: "Choose your vehicle type" }),
  vehicleMake: z.string().trim().min(2, "Enter the vehicle company").max(40),
  vehicleModel: z.string().trim().min(1, "Enter the model").max(40),
  registrationNumber: registration,
  service: serviceChoice,
  preferredDate: ymd,
  preferredTime: hm,
  problemDescription: z.string().trim().max(1000, "Keep the description under 1000 characters").default(""),
  // Honeypot: real people never see or fill this field.
  website: z.string().max(500).optional().default(""),
});
export type BookingInput = z.input<typeof bookingSchema>;

export const enquirySchema = z.object({
  name,
  mobile: mobileField,
  email: z.union([z.literal(""), z.email("Enter a valid email address")]).default(""),
  vehicleType: z.union([z.literal(""), z.enum(VEHICLE_TYPE_VALUES)]).default(""),
  subject: z.string().trim().min(1).max(80).default("General enquiry"),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(1500),
  website: z.string().max(500).optional().default(""),
});
export type EnquiryInput = z.input<typeof enquirySchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password").max(200),
  remember: z.boolean().optional().default(false),
});

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

const price = z
  .union([z.number(), z.string(), z.null()])
  .transform((v, ctx) => {
    if (v === null || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/[₹,\s]/g, ""));
    if (!Number.isFinite(n) || n < 0 || n > 10_000_000 || !Number.isInteger(n)) {
      ctx.addIssue({ code: "custom", message: "Enter a whole number of rupees, or leave empty" });
      return z.NEVER;
    }
    return n;
  });

export const bookingUpdateSchema = z
  .object({
    status: z.enum(BOOKING_STATUS_VALUES).optional(),
    adminNotes: z.string().trim().max(2000).optional(),
    preferredDate: ymd.optional(),
    preferredTime: hm.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export const enquiryUpdateSchema = z.object({ status: z.enum(ENQUIRY_STATUS_VALUES) });

export const serviceSchema = z.object({
  categoryId: z.coerce.number().int().positive("Choose a category"),
  name: z.string().trim().min(2, "Enter a service name").max(80),
  description: z.string().trim().max(400).default(""),
  icon: z.enum(ICON_KEYS).default("wrench"),
  priceFrom: price.default(null),
  priceNote: z.string().trim().max(40).default(""),
  duration: z.string().trim().max(40).default(""),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export const servicePatchSchema = serviceSchema.partial();

export const categoryPatchSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  shortName: z.string().trim().max(30).optional(),
  description: z.string().trim().max(400).optional(),
  imageUrl: z.string().trim().max(2000).optional(),
});

export const packageSchema = z.object({
  name: z.string().trim().min(2, "Enter a package name").max(60),
  vehicleClass: z.enum(PACKAGE_CLASS_VALUES),
  tagline: z.string().trim().max(80).default(""),
  price: price.default(null),
  duration: z.string().trim().max(40).default(""),
  features: z
    .array(z.string().trim().min(1).max(120))
    .max(20, "Up to 20 items")
    .default([]),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export const packagePatchSchema = packageSchema.partial();

const imageUrl = z
  .string()
  .trim()
  .min(1, "Add an image")
  .max(2000)
  .refine((v) => v.startsWith("/") || /^https?:\/\//i.test(v), "Use an uploaded image or a full https:// link");

export const galleryItemSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(80),
  caption: z.string().trim().max(200).default(""),
  category: z.enum(GALLERY_CATEGORY_VALUES),
  imageUrl,
  alt: z.string().trim().max(160).default(""),
  isPublished: z.boolean().default(true),
});
export const galleryPatchSchema = galleryItemSchema.partial();

export const testimonialSchema = z.object({
  customerName: z.string().trim().min(2, "Enter the customer's name").max(60),
  vehicle: z.string().trim().max(60).default(""),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().min(10, "Review is too short").max(800),
  isSample: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});
export const testimonialPatchSchema = testimonialSchema.partial();

export const reorderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(500),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(60),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  role: z.enum(ROLE_VALUES),
  password: z.string().min(8, "At least 8 characters").max(128),
});
export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  role: z.enum(ROLE_VALUES).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(128).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "At least 8 characters").max(128),
});

/** Turns a ZodError into { field: "first message" } for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
