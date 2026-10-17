import "server-only";
import { cache } from "react";
import { and, asc, count, eq, inArray, max, ne, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  bookings,
  serviceCategories,
  servicePackages,
  services,
  type Service,
  type ServiceCategory,
  type ServicePackage,
} from "@/lib/db/schema";
import { SEED_CATEGORIES, SEED_PACKAGES, SEED_SERVICES } from "@/content/seed-data";
import { slugify } from "@/lib/format";
import { ApiError } from "@/lib/api";

export type CategoryWithServices = ServiceCategory & { services: Service[] };

/* ------------------------------------------------------------------ */
/* Fallback content (used only if the database is unreachable)        */
/* ------------------------------------------------------------------ */

const epoch = new Date(0);

function fallbackCatalog(): CategoryWithServices[] {
  return SEED_CATEGORIES.map((c, ci) => ({
    id: -(ci + 1),
    ...c,
    vehicleTypes: [...c.vehicleTypes],
    createdAt: epoch,
    updatedAt: epoch,
    services: SEED_SERVICES.filter((s) => s.category === c.slug).map((s, si) => ({
      id: -(ci * 100 + si + 1),
      categoryId: -(ci + 1),
      name: s.name,
      slug: s.slug,
      description: s.description,
      icon: s.icon,
      priceFrom: s.priceFrom,
      priceNote: s.priceNote ?? "",
      duration: s.duration ?? "",
      isFeatured: !!s.featured,
      isActive: true,
      sortOrder: si,
      createdAt: epoch,
      updatedAt: epoch,
    })),
  }));
}

function fallbackPackages(): ServicePackage[] {
  return SEED_PACKAGES.map((p, i) => ({
    id: -(i + 1),
    ...p,
    features: [...p.features],
    isActive: true,
    sortOrder: i,
    createdAt: epoch,
    updatedAt: epoch,
  }));
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export const getCatalog = cache(
  async (includeInactive: boolean = false): Promise<CategoryWithServices[]> => {
    try {
      const db = await getDb();
      const cats = await db.select().from(serviceCategories).orderBy(asc(serviceCategories.sortOrder));
      const svc = await db
        .select()
        .from(services)
        .where(includeInactive ? undefined : eq(services.isActive, true))
        .orderBy(asc(services.sortOrder), asc(services.id));
      const all = cats.map((c) => ({ ...c, services: svc.filter((s) => s.categoryId === c.id) }));
      // The public site only shows categories the garage currently offers something in.
      return includeInactive ? all : all.filter((c) => c.services.length > 0);
    } catch (error) {
      if (includeInactive) throw error;
      console.error("[catalog] Falling back to default services:", error);
      return fallbackCatalog();
    }
  },
);

export const getPackages = cache(
  async (includeInactive: boolean = false): Promise<ServicePackage[]> => {
    try {
      const db = await getDb();
      return await db
        .select()
        .from(servicePackages)
        .where(includeInactive ? undefined : eq(servicePackages.isActive, true))
        .orderBy(asc(servicePackages.sortOrder), asc(servicePackages.id));
    } catch (error) {
      if (includeInactive) throw error;
      console.error("[catalog] Falling back to default packages:", error);
      return fallbackPackages();
    }
  },
);

/* ------------------------------------------------------------------ */
/* Admin: services                                                     */
/* ------------------------------------------------------------------ */

async function uniqueServiceSlug(name: string, excludeId?: number): Promise<string> {
  const db = await getDb();
  const base = slugify(name) || "service";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const [hit] = await db
      .select({ id: services.id })
      .from(services)
      .where(excludeId ? and(eq(services.slug, candidate), ne(services.id, excludeId)) : eq(services.slug, candidate))
      .limit(1);
    if (!hit) return candidate;
  }
  return `${base}-${Date.now()}`;
}

type ServiceInput = {
  categoryId: number;
  name: string;
  description: string;
  icon: string;
  priceFrom: number | null;
  priceNote: string;
  duration: string;
  isFeatured: boolean;
  isActive: boolean;
};

async function assertCategory(categoryId: number) {
  const db = await getDb();
  const [cat] = await db
    .select({ id: serviceCategories.id })
    .from(serviceCategories)
    .where(eq(serviceCategories.id, categoryId))
    .limit(1);
  if (!cat) throw new ApiError(422, "Choose a valid category.", { categoryId: "Choose a valid category" });
}

export async function createService(input: ServiceInput) {
  await assertCategory(input.categoryId);
  const db = await getDb();
  const [{ top }] = await db
    .select({ top: max(services.sortOrder) })
    .from(services)
    .where(eq(services.categoryId, input.categoryId));
  const [row] = await db
    .insert(services)
    .values({ ...input, slug: await uniqueServiceSlug(input.name), sortOrder: (top ?? 0) + 1 })
    .returning();
  return row;
}

export async function updateService(id: number, input: Partial<ServiceInput>) {
  if (input.categoryId) await assertCategory(input.categoryId);
  const db = await getDb();
  const patch: Partial<ServiceInput> & { slug?: string; updatedAt: ReturnType<typeof sql> } = {
    ...input,
    updatedAt: sql`now()`,
  };
  if (input.name) patch.slug = await uniqueServiceSlug(input.name, id);
  const [row] = await db.update(services).set(patch).where(eq(services.id, id)).returning();
  if (!row) throw new ApiError(404, "That service no longer exists.");
  return row;
}

export async function deleteService(id: number) {
  const db = await getDb();
  const [row] = await db.delete(services).where(eq(services.id, id)).returning({ id: services.id });
  if (!row) throw new ApiError(404, "That service no longer exists.");
}

export async function reorderServices(ids: number[]) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.update(services).set({ sortOrder: index + 1 }).where(eq(services.id, id));
    }
  });
}

export async function updateCategory(
  id: number,
  input: { name?: string; shortName?: string; description?: string; imageUrl?: string },
) {
  const db = await getDb();
  const [row] = await db
    .update(serviceCategories)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(serviceCategories.id, id))
    .returning();
  if (!row) throw new ApiError(404, "That category no longer exists.");
  return row;
}

export async function serviceUsageCounts(): Promise<Record<number, number>> {
  const db = await getDb();
  const rows = await db
    .select({ id: bookings.serviceId, n: count() })
    .from(bookings)
    .where(sql`${bookings.serviceId} is not null`)
    .groupBy(bookings.serviceId);
  return Object.fromEntries(rows.map((r) => [r.id as number, Number(r.n)]));
}

/* ------------------------------------------------------------------ */
/* Admin: packages                                                     */
/* ------------------------------------------------------------------ */

type PackageInput = {
  name: string;
  vehicleClass: string;
  tagline: string;
  price: number | null;
  duration: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
};

export async function createPackage(input: PackageInput) {
  const db = await getDb();
  const [{ top }] = await db.select({ top: max(servicePackages.sortOrder) }).from(servicePackages);
  const [row] = await db
    .insert(servicePackages)
    .values({ ...input, sortOrder: (top ?? 0) + 1 })
    .returning();
  return row;
}

export async function updatePackage(id: number, input: Partial<PackageInput>) {
  const db = await getDb();
  const [row] = await db
    .update(servicePackages)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(servicePackages.id, id))
    .returning();
  if (!row) throw new ApiError(404, "That package no longer exists.");
  return row;
}

export async function deletePackage(id: number) {
  const db = await getDb();
  const [row] = await db
    .delete(servicePackages)
    .where(eq(servicePackages.id, id))
    .returning({ id: servicePackages.id });
  if (!row) throw new ApiError(404, "That package no longer exists.");
}

export async function reorderPackages(ids: number[]) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.update(servicePackages).set({ sortOrder: index + 1 }).where(eq(servicePackages.id, id));
    }
  });
}

export async function getServicesByIds(ids: number[]) {
  if (!ids.length) return [];
  const db = await getDb();
  return db.select().from(services).where(inArray(services.id, ids));
}
