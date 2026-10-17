"use client";

import { apiRequest } from "./client-api";

/**
 * Resizes and re-encodes a photo in the browser before upload, so a 6 MB phone
 * photo becomes a ~300 KB WebP/JPEG. SVG and GIF files are uploaded unchanged.
 */
export async function prepareImage(file: File, maxDimension = 1920, quality = 0.82): Promise<{ blob: Blob; width?: number; height?: number; name: string }> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file (JPG, PNG, WebP).");
  if (file.type === "image/svg+xml" || file.type === "image/gif") return { blob: file, name: file.name };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This image couldn't be read. Try a JPG or PNG.");
  }
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await toBlob("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
  if (!blob) throw new Error("Your browser couldn't compress this image.");
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + `.${ext}`;
  return { blob, width, height, name };
}

export async function uploadImage(file: File): Promise<{ id: string; url: string }> {
  const prepared = await prepareImage(file);
  if (prepared.blob.size > 4 * 1024 * 1024) throw new Error("This image is still larger than 4 MB after compression.");
  const form = new FormData();
  form.append("file", new File([prepared.blob], prepared.name, { type: prepared.blob.type }));
  if (prepared.width) form.append("width", String(prepared.width));
  if (prepared.height) form.append("height", String(prepared.height));
  return apiRequest<{ id: string; url: string }>("/api/admin/media", { formData: form });
}
