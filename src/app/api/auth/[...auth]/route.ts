import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL!;

// forward all /api/auth/* requests to the auth service
// this keeps cookies on econoquest.wahb.space instead of the HF domain
export async function GET(
  request: NextRequest,
  { params }: { params: { auth: string[] } }
) {
  return forwardRequest(request, params.auth, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { auth: string[] } }
) {
  return forwardRequest(request, params.auth, "POST");
}

async function forwardRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
): Promise<NextResponse> {
  const path     = pathSegments.join("/");
  const url      = new URL(request.url);
  const query    = url.search;
  const targetUrl = `${AUTH_SERVICE}/auth/${path}${query}`;

  // forward cookies from the browser to the auth service
  const cookieHeader = request.headers.get("cookie") ?? "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  let body: string | undefined;
  if (method === "POST") {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual", // handle redirects ourselves
    });

    // handle redirect (OAuth callback)
    if (res.status === 302 || res.status === 301) {
      const location = res.headers.get("location") ?? "/";
      const response = NextResponse.redirect(new URL(location, request.url));
      forwardSetCookies(res, response);
      return response;
    }

    // build response
    const responseBody = await res.text();
    const response = new NextResponse(responseBody, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });

    // forward Set-Cookie headers from auth service to browser
    // but rewrite domain so cookies land on econoquest.wahb.space
    forwardSetCookies(res, response);

    return response;

  } catch (err: any) {
    console.error("[api/auth] forward error:", err.message);
    return NextResponse.json(
      { error: "Auth service unavailable" },
      { status: 503 }
    );
  }
}

function forwardSetCookies(
  sourceRes: Response,
  targetRes: NextResponse
): void {
  // get all Set-Cookie headers
  const setCookies = sourceRes.headers.getSetCookie?.() ?? [];

  for (const cookie of setCookies) {
    // rewrite the cookie so it's set on our domain
    // strip Domain= and SameSite= then re-add appropriate values
    const parts  = cookie.split(";").map(p => p.trim());
    const [nameVal, ...attrs] = parts;

    const filteredAttrs = attrs.filter(a =>
      !a.toLowerCase().startsWith("domain") &&
      !a.toLowerCase().startsWith("samesite")
    );

    // add SameSite=Lax since we're now same-domain
    filteredAttrs.push("SameSite=Lax");

    const rewritten = [nameVal, ...filteredAttrs].join("; ");
    targetRes.headers.append("Set-Cookie", rewritten);
  }
}