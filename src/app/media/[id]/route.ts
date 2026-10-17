import { getMedia } from "@/lib/data/media";

export const dynamic = "force-dynamic";

/** Serves images uploaded from the admin panel. */
export async function GET(_request: Request, ctx: RouteContext<"/media/[id]">) {
  const { id } = await ctx.params;
  try {
    const file = await getMedia(id);
    if (!file) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.data.length),
        // Uploaded files never change (new upload = new id), so cache them for a year.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch (error) {
    console.error("[media]", error);
    return new Response("Image unavailable", { status: 503 });
  }
}
