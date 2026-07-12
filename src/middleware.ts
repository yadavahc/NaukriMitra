import { NextRequest, NextResponse } from "next/server";

// Single-user gate. Everything except /login and /api/auth is protected.
const PUBLIC = ["/login", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p)) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  const token = req.cookies.get("nm_auth")?.value;
  const expected = process.env.AUTH_SECRET || "change-me";
  if (token !== expected) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:pdf|png|jpg|svg)).*)"],
};
