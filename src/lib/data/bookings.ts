import "server-only";
import { randomInt } from "node:crypto";
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/lib/db/client";
import { bookings, enquiries, servicePackages, serviceCategories, services, type Booking } from "@/lib/db/schema";
import { ApiError } from "@/lib/api";
import {
  BOOKING_STATUS_VALUES,
  ENQUIRY_STATUS_VALUES,
  VEHICLE_TYPES,
  VEHICLE_TYPE_VALUES,
  type BookingStatus,
  type VehicleType,
} from "@/lib/constants";
import { addDays, availableSlots, isOpenOn, isValidYmd, todayIST } from "@/lib/dates";
import { compactRegistration, formatRegistration, normalizeIndianMobile } from "@/lib/format";
import type { bookingSchema, enquirySchema } from "@/lib/validation";
import { getSettings } from "./settings";
import { FALLBACK_SERVICE_SLUG } from "@/content/seed-data";

type BookingData = z.output<typeof bookingSchema>;
type EnquiryData = z.output<typeof enquirySchema>;

const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function newReference(): string {
  const ymd = todayIST().replaceAll("-", "").slice(2);
  let tail = "";
  for (let i = 0; i < 4; i++) tail += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `BK-${ymd}-${tail}`;
}

function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string; cause?: { code?: string } })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}

/** Validates the slot against opening hours and resolves the requested service, then stores the booking. */
export async function createBooking(input: BookingData, ipHash: string | null) {
  const settings = await getSettings();
  const { hours, slotMinutes, bookingWindowDays } = settings.business;
  const today = todayIST();

  if (!isValidYmd(input.preferredDate) || input.preferredDate < today) {
    throw new ApiError(422, "Please choose a date from today onwards.", { preferredDate: "Choose a date from today onwards" });
  }
  if (input.preferredDate > addDays(today, bookingWindowDays)) {
    throw new ApiError(422, `Bookings open up to ${bookingWindowDays} days ahead.`, {
      preferredDate: `Choose a date within the next ${bookingWindowDays} days`,
    });
  }
  if (!isOpenOn(hours, input.preferredDate)) {
    throw new ApiError(422, "We're closed on that day.", { preferredDate: "We're closed that day. Pick another date" });
  }
  if (!availableSlots(hours, input.preferredDate, slotMinutes).includes(input.preferredTime)) {
    throw new ApiError(422, "That time slot isn't available.", { preferredTime: "Choose one of the available time slots" });
  }

  const mobile = normalizeIndianMobile(input.mobile);
  if (!mobile) throw new ApiError(422, "Enter a valid mobile number.", { mobile: "Enter a valid 10-digit Indian mobile number" });

  const vehicle = VEHICLE_TYPES.find((v) => v.value === input.vehicleType)!;
  const db = await getDb();

  let serviceId: number | null = null;
  let packageId: number | null = null;
  let serviceName = "";

  const [kind, rawId] = input.service.split(":");
  if (kind === "service") {
    const [row] = await db
      .select({ id: services.id, name: services.name, isActive: services.isActive, vehicleTypes: serviceCategories.vehicleTypes })
      .from(services)
      .innerJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(eq(services.id, Number(rawId)))
      .limit(1);
    if (!row || !row.isActive) throw new ApiError(422, "That service is no longer offered.", { service: "Choose another service" });
    if (!row.vehicleTypes.includes(vehicle.value)) {
      throw new ApiError(422, "That service isn't available for this vehicle type.", {
        service: `Choose a service for your ${vehicle.label.toLowerCase()}`,
      });
    }
    serviceId = row.id;
    serviceName = row.name;
  } else if (kind === "package") {
    const [row] = await db.select().from(servicePackages).where(eq(servicePackages.id, Number(rawId))).limit(1);
    if (!row || !row.isActive) throw new ApiError(422, "That package is no longer offered.", { service: "Choose another option" });
    if (row.vehicleClass !== vehicle.packageClass) {
      throw new ApiError(422, "That package is for a different vehicle type.", { service: "Choose a package for your vehicle" });
    }
    packageId = row.id;
    serviceName = `${row.name} (package)`;
  } else {
    const [row] = await db
      .select({ id: services.id, isActive: services.isActive })
      .from(services)
      .where(eq(services.slug, FALLBACK_SERVICE_SLUG))
      .limit(1);
    serviceId = row?.isActive ? row.id : null;
    serviceName = "Inspection & diagnosis (not sure what's needed)";
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [row] = await db
        .insert(bookings)
        .values({
          reference: newReference(),
          customerName: input.customerName,
          mobile,
          vehicleType: vehicle.value,
          vehicleMake: input.vehicleMake,
          vehicleModel: input.vehicleModel,
          registrationNumber: formatRegistration(input.registrationNumber),
          serviceId,
          packageId,
          serviceName,
          preferredDate: input.preferredDate,
          preferredTime: input.preferredTime,
          problemDescription: input.problemDescription ?? "",
          ipHash,
        })
        .returning();
      return row;
    } catch (error) {
      if (isUniqueViolation(error) && attempt < 4) continue;
      throw error;
    }
  }
  throw new ApiError(500, "Could not create the booking. Please try again.");
}

/* ------------------------------------------------------------------ */
/* Admin queries                                                       */
/* ------------------------------------------------------------------ */

export type BookingFilters = {
  q?: string;
  status?: string;
  vehicleType?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export function parseBookingFilters(params: Record<string, string | string[] | undefined>): BookingFilters {
  const one = (k: string) => {
    const v = params[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const status = one("status");
  const vehicleType = one("vehicle");
  const from = one("from");
  const to = one("to");
  const sort = one("sort");
  return {
    q: one("q")?.slice(0, 80),
    status: status && (BOOKING_STATUS_VALUES as readonly string[]).includes(status) ? status : undefined,
    vehicleType: vehicleType && (VEHICLE_TYPE_VALUES as readonly string[]).includes(vehicleType) ? vehicleType : undefined,
    from: from && isValidYmd(from) ? from : undefined,
    to: to && isValidYmd(to) ? to : undefined,
    sort: sort && ["newest", "oldest", "appointment", "appointment_desc"].includes(sort) ? sort : "newest",
    page: Math.max(1, Number(one("page")) || 1),
    pageSize: 20,
  };
}

function bookingWhere(f: BookingFilters): SQL | undefined {
  const conds: SQL[] = [];
  if (f.status) conds.push(eq(bookings.status, f.status));
  if (f.vehicleType) conds.push(eq(bookings.vehicleType, f.vehicleType));
  if (f.from) conds.push(gte(bookings.preferredDate, f.from));
  if (f.to) conds.push(lte(bookings.preferredDate, f.to));
  if (f.q) {
    const like = `%${f.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    const digits = f.q.replace(/\D/g, "");
    const reg = compactRegistration(f.q);
    const any: SQL[] = [
      ilike(bookings.reference, like),
      ilike(bookings.customerName, like),
      ilike(bookings.vehicleMake, like),
      ilike(bookings.vehicleModel, like),
      ilike(bookings.serviceName, like),
    ];
    if (digits.length >= 3) any.push(sql`regexp_replace(${bookings.mobile}, '\\D', '', 'g') like ${`%${digits}%`}`);
    if (reg.length >= 3) {
      any.push(sql`regexp_replace(upper(${bookings.registrationNumber}), '[^A-Z0-9]', '', 'g') like ${`%${reg}%`}`);
    }
    conds.push(or(...any)!);
  }
  return conds.length ? and(...conds) : undefined;
}

function bookingOrder(sort?: string) {
  switch (sort) {
    case "oldest":
      return [asc(bookings.createdAt)];
    case "appointment":
      return [asc(bookings.preferredDate), asc(bookings.preferredTime)];
    case "appointment_desc":
      return [desc(bookings.preferredDate), desc(bookings.preferredTime)];
    default:
      return [desc(bookings.createdAt)];
  }
}

export async function listBookings(f: BookingFilters) {
  const db = await getDb();
  const where = bookingWhere(f);
  const pageSize = f.pageSize ?? 20;
  const page = f.page ?? 1;
  const [{ total }] = await db.select({ total: count() }).from(bookings).where(where);
  const rows = await db
    .select()
    .from(bookings)
    .where(where)
    .orderBy(...bookingOrder(f.sort))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return { rows, total: Number(total), page, pageSize, pages: Math.max(1, Math.ceil(Number(total) / pageSize)) };
}

export async function exportBookings(f: BookingFilters): Promise<Booking[]> {
  const db = await getDb();
  return db.select().from(bookings).where(bookingWhere(f)).orderBy(...bookingOrder(f.sort)).limit(10000);
}

export async function getBooking(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return row ?? null;
}

export async function updateBooking(
  id: number,
  patch: { status?: BookingStatus; adminNotes?: string; preferredDate?: string; preferredTime?: string },
) {
  const db = await getDb();
  const current = await getBooking(id);
  if (!current) throw new ApiError(404, "That booking no longer exists.");
  const now = new Date();
  const set: Partial<typeof bookings.$inferInsert> = { ...patch, updatedAt: now };
  if (patch.status && patch.status !== current.status) set.statusChangedAt = now;
  const [row] = await db.update(bookings).set(set).where(eq(bookings.id, id)).returning();
  return row;
}

export async function deleteBooking(id: number) {
  const db = await getDb();
  const [row] = await db.delete(bookings).where(eq(bookings.id, id)).returning({ id: bookings.id });
  if (!row) throw new ApiError(404, "That booking no longer exists.");
}

/** Dashboard numbers. */
export async function getDashboardData() {
  const db = await getDb();
  const today = todayIST();
  const since = addDays(today, -13);

  const statusRows = await db
    .select({ status: bookings.status, n: count() })
    .from(bookings)
    .groupBy(bookings.status);
  const byStatus = Object.fromEntries(BOOKING_STATUS_VALUES.map((s) => [s, 0])) as Record<BookingStatus, number>;
  for (const r of statusRows) if (r.status in byStatus) byStatus[r.status as BookingStatus] = Number(r.n);
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

  const dailyRows = await db
    .select({
      day: sql<string>`to_char(${bookings.createdAt} at time zone 'Asia/Kolkata', 'YYYY-MM-DD')`,
      n: count(),
    })
    .from(bookings)
    .where(sql`${bookings.createdAt} >= (${since}::date::timestamp at time zone 'Asia/Kolkata')`)
    .groupBy(sql`1`);
  const daily = Array.from({ length: 14 }, (_, i) => {
    const day = addDays(since, i);
    return { day, count: Number(dailyRows.find((r) => r.day === day)?.n ?? 0) };
  });

  const vehicleRows = await db
    .select({ type: bookings.vehicleType, n: count() })
    .from(bookings)
    .groupBy(bookings.vehicleType);
  const byVehicle = VEHICLE_TYPES.map((v) => ({
    type: v.value as VehicleType,
    label: v.label,
    count: Number(vehicleRows.find((r) => r.type === v.value)?.n ?? 0),
  }));

  const todays = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.preferredDate, today), sql`${bookings.status} in ('pending','confirmed')`))
    .orderBy(asc(bookings.preferredTime))
    .limit(12);

  const recent = await db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(6);

  const enquiryRows = await db
    .select({ status: enquiries.status, n: count() })
    .from(enquiries)
    .groupBy(enquiries.status);
  const enquiryCounts = Object.fromEntries(ENQUIRY_STATUS_VALUES.map((s) => [s, 0])) as Record<string, number>;
  for (const r of enquiryRows) enquiryCounts[r.status] = Number(r.n);
  const recentEnquiries = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(5);

  const [{ n: sampleBookings }] = await db.select({ n: count() }).from(bookings).where(eq(bookings.isSample, true));
  const [{ n: sampleEnquiries }] = await db.select({ n: count() }).from(enquiries).where(eq(enquiries.isSample, true));

  return {
    total,
    byStatus,
    daily,
    byVehicle,
    todays,
    recent,
    enquiryCounts,
    recentEnquiries,
    sampleCount: Number(sampleBookings) + Number(sampleEnquiries),
  };
}

export async function countPendingBookings(): Promise<number> {
  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(bookings).where(eq(bookings.status, "pending"));
  return Number(n);
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

export async function createEnquiry(input: EnquiryData, ipHash: string | null) {
  const mobile = normalizeIndianMobile(input.mobile);
  if (!mobile) throw new ApiError(422, "Enter a valid mobile number.", { mobile: "Enter a valid 10-digit Indian mobile number" });
  const db = await getDb();
  const [row] = await db
    .insert(enquiries)
    .values({
      name: input.name,
      mobile,
      email: input.email ?? "",
      vehicleType: input.vehicleType ?? "",
      subject: input.subject || "General enquiry",
      message: input.message,
      ipHash,
    })
    .returning();
  return row;
}

export async function listEnquiries(f: { q?: string; status?: string; page?: number }) {
  const db = await getDb();
  const conds: SQL[] = [];
  if (f.status && (ENQUIRY_STATUS_VALUES as readonly string[]).includes(f.status)) conds.push(eq(enquiries.status, f.status));
  if (f.q) {
    const like = `%${f.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    const digits = f.q.replace(/\D/g, "");
    const any: SQL[] = [ilike(enquiries.name, like), ilike(enquiries.message, like), ilike(enquiries.subject, like), ilike(enquiries.email, like)];
    if (digits.length >= 3) any.push(sql`regexp_replace(${enquiries.mobile}, '\\D', '', 'g') like ${`%${digits}%`}`);
    conds.push(or(...any)!);
  }
  const where = conds.length ? and(...conds) : undefined;
  const pageSize = 20;
  const page = Math.max(1, f.page ?? 1);
  const [{ total }] = await db.select({ total: count() }).from(enquiries).where(where);
  const rows = await db
    .select()
    .from(enquiries)
    .where(where)
    .orderBy(desc(enquiries.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return { rows, total: Number(total), page, pageSize, pages: Math.max(1, Math.ceil(Number(total) / pageSize)) };
}

export async function updateEnquiryStatus(id: number, status: string) {
  const db = await getDb();
  const [row] = await db
    .update(enquiries)
    .set({ status, updatedAt: sql`now()` })
    .where(eq(enquiries.id, id))
    .returning();
  if (!row) throw new ApiError(404, "That enquiry no longer exists.");
  return row;
}

export async function deleteEnquiry(id: number) {
  const db = await getDb();
  const [row] = await db.delete(enquiries).where(eq(enquiries.id, id)).returning({ id: enquiries.id });
  if (!row) throw new ApiError(404, "That enquiry no longer exists.");
}

export async function countNewEnquiries(): Promise<number> {
  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(enquiries).where(eq(enquiries.status, "new"));
  return Number(n);
}

/** Removes the demo bookings and enquiries (keeps everything customers submitted). */
export async function clearSampleData() {
  const db = await getDb();
  const b = await db.delete(bookings).where(eq(bookings.isSample, true)).returning({ id: bookings.id });
  const e = await db.delete(enquiries).where(eq(enquiries.isSample, true)).returning({ id: enquiries.id });
  return { bookings: b.length, enquiries: e.length };
}
