import { NextRequest, NextResponse } from "next/server";

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL!;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ game: string[] }> }
) {
  const { game } = await params;
  const path = game.join("/");
  const cookieHeader = request.headers.get("cookie") ?? "";

  try {
    const body = await request.text();

    // get JWT token from cookie to forward to proxy
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const [k, ...v] = c.trim().split("=");
        return [k.trim(), v.join("=")];
      })
    );
    const accessToken = cookies["access_token"] ?? "";

    const res = await fetch(`${PROXY_URL}/api/game/${path}`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": accessToken ? `Bearer ${accessToken}` : "",
        "Cookie":        cookieHeader,
      },
      body,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status:  res.status,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Proxy unavailable" }, { status: 503 });
  }
}
