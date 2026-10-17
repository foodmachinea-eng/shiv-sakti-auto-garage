import { NextResponse, type NextRequest } from "next/server";
import { decodeJwt } from "jose";

const SESSION_COOKIE = "garage_admin_session";

/**
 * Optimistic route protection for the admin area: signed-out visitors are sent
 * to the login page before anything renders. This is only the first line of
 * defence — every admin page and API route also verifies the session
 * signature and the user's account on the server (src/lib/auth/dal.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasLiveSession = isUnexpired(token);

  if (pathname.startsWith("/api/admin")) {
    if (!hasLiveSession) {
      return NextResponse.json(
        { error: "Your session has ended. Please sign in again." },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!hasLiveSession) {
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

function isUnexpired(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const { exp } = decodeJwt(token);
    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
