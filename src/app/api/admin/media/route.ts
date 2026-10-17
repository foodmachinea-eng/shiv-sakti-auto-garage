import { ApiError, assertSameOrigin, handle, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { saveUpload } from "@/lib/data/media";

export const dynamic = "force-dynamic";

/** Image upload (multipart/form-data with a "file" field). Images are resized in the browser first. */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const user = await requireApiUser();
  if (!can(user.role, "gallery.manage") && !can(user.role, "content.manage")) {
    throw new ApiError(403, "Your account doesn't have permission to upload images.");
  }
  const form = await request.formData().catch(() => {
    throw new ApiError(400, "Send the image as a file upload.");
  });
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(422, "Choose an image to upload.");
  const saved = await saveUpload(file, {
    width: Number(form.get("width")) || undefined,
    height: Number(form.get("height")) || undefined,
  });
  return ok({ ok: true, ...saved }, { status: 201 });
});
