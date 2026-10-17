import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Binary column for uploaded images (Postgres `bytea`). */
const bytea = customType<{ data: Buffer; driverData: Buffer | Uint8Array }>({
  dataType() {
    return "bytea";
  },
  fromDriver(value) {
    return Buffer.isBuffer(value) ? value : Buffer.from(value);
  },
  toDriver(value) {
    return value;
  },
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/* ------------------------------------------------------------------ */
/* Site content                                                        */
/* ------------------------------------------------------------------ */

/** Editable website content and business details, one JSON document per section. */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Internal key/value flags (for example: when demo content was seeded). */
export const appMeta = pgTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  icon: text("icon").notNull().default("wrench"),
  /** Booking-form vehicle types that map to this category. */
  vehicleTypes: jsonb("vehicle_types").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => serviceCategories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    icon: text("icon").notNull().default("wrench"),
    /** Indicative starting price in whole rupees. Null = "price after inspection". */
    priceFrom: integer("price_from"),
    priceNote: text("price_note").notNull().default(""),
    duration: text("duration").notNull().default(""),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("services_category_idx").on(t.categoryId, t.sortOrder)],
);

export const servicePackages = pgTable(
  "service_packages",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    /** car | bike | other */
    vehicleClass: text("vehicle_class").notNull().default("car"),
    tagline: text("tagline").notNull().default(""),
    /** Indicative price in whole rupees. Null = "price on inspection". */
    price: integer("price"),
    duration: text("duration").notNull().default(""),
    features: jsonb("features").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    isPopular: boolean("is_popular").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("packages_class_idx").on(t.vehicleClass, t.sortOrder)],
);

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  caption: text("caption").notNull().default(""),
  category: text("category").notNull().default("workshop"),
  imageUrl: text("image_url").notNull(),
  alt: text("alt").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  ...timestamps,
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  vehicle: text("vehicle").notNull().default(""),
  rating: integer("rating").notNull().default(5),
  content: text("content").notNull(),
  /** Sample reviews are labelled on the website until replaced by genuine ones. */
  isSample: boolean("is_sample").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** Images uploaded from the admin panel (stored in Postgres so no extra storage service is needed). */
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull(),
    customerName: text("customer_name").notNull(),
    mobile: text("mobile").notNull(),
    /** car | bike | scooter | auto_rickshaw | other */
    vehicleType: text("vehicle_type").notNull(),
    vehicleMake: text("vehicle_make").notNull(),
    vehicleModel: text("vehicle_model").notNull(),
    registrationNumber: text("registration_number").notNull(),
    serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
    packageId: integer("package_id").references(() => servicePackages.id, { onDelete: "set null" }),
    /** Snapshot of the requested service/package name at booking time. */
    serviceName: text("service_name").notNull(),
    preferredDate: date("preferred_date", { mode: "string" }).notNull(),
    /** 24h "HH:MM" slot start */
    preferredTime: text("preferred_time").notNull(),
    problemDescription: text("problem_description").notNull().default(""),
    /** pending | confirmed | completed | cancelled */
    status: text("status").notNull().default("pending"),
    adminNotes: text("admin_notes").notNull().default(""),
    isSample: boolean("is_sample").notNull().default(false),
    source: text("source").notNull().default("website"),
    ipHash: text("ip_hash"),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("bookings_reference_idx").on(t.reference),
    index("bookings_status_idx").on(t.status),
    index("bookings_date_idx").on(t.preferredDate),
    index("bookings_created_idx").on(t.createdAt),
  ],
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    mobile: text("mobile").notNull(),
    email: text("email").notNull().default(""),
    vehicleType: text("vehicle_type").notNull().default(""),
    subject: text("subject").notNull().default("General enquiry"),
    message: text("message").notNull(),
    /** new | in_progress | resolved */
    status: text("status").notNull().default("new"),
    isSample: boolean("is_sample").notNull().default(false),
    ipHash: text("ip_hash"),
    ...timestamps,
  },
  (t) => [index("enquiries_status_idx").on(t.status), index("enquiries_created_idx").on(t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  /** Always stored lower-case. */
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  /** admin | staff */
  role: text("role").notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  /** Incremented to invalidate every existing session for this user. */
  sessionVersion: integer("session_version").notNull().default(1),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

/** Sliding-window rate limiting for login and public forms (works across serverless instances). */
export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    bucket: text("bucket").notNull(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("rate_limit_lookup_idx").on(t.bucket, t.key, t.createdAt)],
);

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServicePackage = typeof servicePackages.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
