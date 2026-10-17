import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { media } from "@/lib/db/schema";
import { ApiError } from "@/lib/api";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // after in-browser compression
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];

/** Checks the file's first bytes so a renamed file can't pretend to be an image. */
function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (bytes.subarray(4, 12).toString("ascii").startsWith("ftypavi")) return "image/avif";
  if (bytes.subarray(0, 6).toString("ascii").startsWith("GIF8")) return "image/gif";
  const head = bytes.subarray(0, 256).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "image/svg+xml";
  return null;
}

export async function saveUpload(file: File, dims?: { width?: number; height?: number }) {
  if (file.size === 0) throw new ApiError(422, "The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(413, "Images must be under 4 MB. Try a smaller photo.");
  }
  const data = Buffer.from(await file.arrayBuffer());
  const detected = sniffImageType(data);
  if (!detected || !ALLOWED_IMAGE_TYPES.includes(detected)) {
    throw new ApiError(415, "Upload a JPG, PNG, WebP, AVIF, GIF or SVG image.");
  }
  if (detected === "image/svg+xml" && /<script|on\w+\s*=|javascript:/i.test(data.toString("utf8"))) {
    throw new ApiError(415, "This SVG contains scripts and can't be uploaded.");
  }
  const db = await getDb();
  const [row] = await db
    .insert(media)
    .values({
      filename: (file.name || "upload").slice(0, 120),
      mimeType: detected,
      sizeBytes: data.length,
      width: dims?.width && Number.isFinite(dims.width) ? Math.round(dims.width) : null,
      height: dims?.height && Number.isFinite(dims.height) ? Math.round(dims.height) : null,
      data,
    })
    .returning({ id: media.id });
  return { id: row.id, url: `/media/${row.id}` };
}

export async function getMedia(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = await getDb();
  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  return row ?? null;
}
