import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { fieldErrors } from "./validation";
import { AuthConfigError } from "./auth/session";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

/** Wraps a route handler with consistent JSON error responses. */
export function handle<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, fields: error.fields },
          { status: error.status, headers: error.status === 429 ? { "Retry-After": "600" } : undefined },
        );
      }
      if (error instanceof AuthConfigError) {
        console.error("[auth]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.error("[api] Unhandled error:", error);
      return NextResponse.json(
        { error: "Something went wrong on our side. Please try again in a moment." },
        { status: 500 },
      );
    }
  };
}

/**
 * Basic CSRF protection for state-changing requests: the browser must send the
 * request from this same site. (Session cookies are also SameSite=Lax.)
 */
export function assertSameOrigin(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new ApiError(403, "Cross-site requests are not allowed.");
  }
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    if (host && new URL(origin).host !== host.split(",")[0].trim()) {
      throw new ApiError(403, "Cross-site requests are not allowed.");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(403, "Invalid request origin.");
  }
}

/** Reads and validates a JSON body. */
export async function readJson<S extends z.ZodType>(
  request: Request,
  schema: S,
  maxBytes = 200_000,
): Promise<z.output<S>> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new ApiError(415, "Send the data as JSON.");
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw new ApiError(413, "The request is too large.");
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > maxBytes) throw new ApiError(413, "The request is too large.");
    body = JSON.parse(text);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "The request body isn't valid JSON.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(422, "Please check the highlighted fields.", fieldErrors(parsed.error));
  }
  return parsed.data;
}

export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(404, "Not found.");
  return id;
}

export function isHttps(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}
