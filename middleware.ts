import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/game"];
const AUTH_ROUTES      = ["/login", "/register"];
const AUTH_SERVICE     = process.env.AUTH_SERVICE_URL!;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken  = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  // already authenticated → redirect away from login
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // not protected → allow through
  if (!isProtected) {
    return NextResponse.next();
  }

  // protected route — has access token → allow
  if (accessToken) {
    return NextResponse.next();
  }

  // no access token but has refresh token → try rotation
  if (refreshToken) {
    try {
      const res = await fetch(`${AUTH_SERVICE}/auth/refresh`, {
        method:  "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });

      if (res.ok) {
        // forward new cookies from auth service to browser
        const response    = NextResponse.next();
        const setCookies  = res.headers.getSetCookie();
        setCookies.forEach(cookie => {
          response.headers.append("Set-Cookie", cookie);
        });
        return response;
      }
    } catch {
      // refresh failed — fall through to redirect
    }
  }

  // no valid session → redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/game/:path*",
    "/login",
    "/register",
  ],
};