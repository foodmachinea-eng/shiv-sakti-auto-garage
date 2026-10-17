/** Small fetch wrapper for the browser: JSON in, JSON out, readable errors. */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export async function apiRequest<T = unknown>(
  url: string,
  options: { method?: string; body?: unknown; formData?: FormData; signal?: AbortSignal } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? (options.body !== undefined || options.formData ? "POST" : "GET"),
      headers: options.formData ? undefined : options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
      credentials: "same-origin",
      signal: options.signal,
    });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new ApiClientError("Couldn't reach the server. Check your internet connection and try again.", 0);
  }

  let data: unknown = null;
  const type = response.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    data = await response.json().catch(() => null);
  }
  if (!response.ok) {
    const body = (data ?? {}) as { error?: string; fields?: Record<string, string> };
    if (response.status === 401 && url.startsWith("/api/admin")) {
      // Session ended: do a full page load so no stale admin data stays in memory.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiClientError(
      body.error ?? `Something went wrong (error ${response.status}). Please try again.`,
      response.status,
      body.fields ?? {},
    );
  }
  return data as T;
}
