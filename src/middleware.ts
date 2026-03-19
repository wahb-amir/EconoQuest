import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/setup", "/dashboard"];
const AUTH_ROUTES      = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken  = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  // already authenticated → redirect away from login/register
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // not a protected route → allow through
  if (!isProtected) {
    return NextResponse.next();
  }

  // has valid access token → allow
  if (accessToken) {
    return NextResponse.next();
  }

  // no access token but has refresh token → try rotation via same-domain API
  if (refreshToken) {
    try {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      const res = await fetch(refreshUrl.toString(), {
        method:  "POST",
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
      });

      if (res.ok) {
        const response   = NextResponse.next();
        const setCookies = res.headers.getSetCookie();
        setCookies.forEach(cookie => {
          response.headers.append("Set-Cookie", cookie);
        });
        return response;
      }
    } catch {
      // fall through to redirect
    }
  }

  // no valid session → redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/setup/:path*",
    "/login",
    "/register",
  ],
};