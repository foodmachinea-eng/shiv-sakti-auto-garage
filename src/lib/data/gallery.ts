import "server-only";
import { cache } from "react";
import { asc, eq, max, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { galleryItems, testimonials, type GalleryItem, type Testimonial } from "@/lib/db/schema";
import { SEED_GALLERY, SEED_TESTIMONIALS } from "@/content/seed-data";
import { ApiError } from "@/lib/api";

const epoch = new Date(0);

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export const getGallery = cache(async (includeHidden: boolean = false): Promise<GalleryItem[]> => {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(galleryItems)
      .where(includeHidden ? undefined : eq(galleryItems.isPublished, true))
      .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id));
  } catch (error) {
    if (includeHidden) throw error;
    console.error("[gallery] Falling back to default gallery:", error);
    return SEED_GALLERY.map((g, i) => ({
      id: -(i + 1),
      ...g,
      caption: "",
      sortOrder: i,
      isPublished: true,
      createdAt: epoch,
      updatedAt: epoch,
    }));
  }
});

type GalleryInput = {
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
  alt: string;
  isPublished: boolean;
};

export async function createGalleryItem(input: GalleryInput) {
  const db = await getDb();
  // New photos go to the front of the gallery.
  const [{ low }] = await db.select({ low: sql<number>`coalesce(min(${galleryItems.sortOrder}), 1)` }).from(galleryItems);
  const [row] = await db
    .insert(galleryItems)
    .values({ ...input, sortOrder: Number(low) - 1 })
    .returning();
  return row;
}

export async function updateGalleryItem(id: number, input: Partial<GalleryInput>) {
  const db = await getDb();
  const [row] = await db
    .update(galleryItems)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(galleryItems.id, id))
    .returning();
  if (!row) throw new ApiError(404, "That photo no longer exists.");
  return row;
}

export async function deleteGalleryItem(id: number) {
  const db = await getDb();
  const [row] = await db.delete(galleryItems).where(eq(galleryItems.id, id)).returning({ id: galleryItems.id });
  if (!row) throw new ApiError(404, "That photo no longer exists.");
}

export async function reorderGallery(ids: number[]) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.update(galleryItems).set({ sortOrder: index + 1 }).where(eq(galleryItems.id, id));
    }
  });
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export const getTestimonials = cache(async (includeHidden: boolean = false): Promise<Testimonial[]> => {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(testimonials)
      .where(includeHidden ? undefined : eq(testimonials.isPublished, true))
      .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  } catch (error) {
    if (includeHidden) throw error;
    console.error("[reviews] Falling back to default reviews:", error);
    return SEED_TESTIMONIALS.map((t, i) => ({
      id: -(i + 1),
      ...t,
      isSample: true,
      isPublished: true,
      sortOrder: i,
      createdAt: epoch,
      updatedAt: epoch,
    }));
  }
});

type TestimonialInput = {
  customerName: string;
  vehicle: string;
  rating: number;
  content: string;
  isSample: boolean;
  isPublished: boolean;
};

export async function createTestimonial(input: TestimonialInput) {
  const db = await getDb();
  const [{ top }] = await db.select({ top: max(testimonials.sortOrder) }).from(testimonials);
  const [row] = await db
    .insert(testimonials)
    .values({ ...input, sortOrder: (top ?? 0) + 1 })
    .returning();
  return row;
}

export async function updateTestimonial(id: number, input: Partial<TestimonialInput>) {
  const db = await getDb();
  const [row] = await db
    .update(testimonials)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(testimonials.id, id))
    .returning();
  if (!row) throw new ApiError(404, "That review no longer exists.");
  return row;
}

export async function deleteTestimonial(id: number) {
  const db = await getDb();
  const [row] = await db.delete(testimonials).where(eq(testimonials.id, id)).returning({ id: testimonials.id });
  if (!row) throw new ApiError(404, "That review no longer exists.");
}

export async function reorderTestimonials(ids: number[]) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.update(testimonials).set({ sortOrder: index + 1 }).where(eq(testimonials.id, id));
    }
  });
}
