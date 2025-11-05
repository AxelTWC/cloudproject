import { NextRequest, NextResponse } from "next/server";

// Global middleware to enforce HTTPS (in production) and set secure headers.
export function middleware(req: NextRequest) {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const nextProto = req.nextUrl && req.nextUrl.protocol; // may be like 'http:' or 'https:'

  // Normalize detection: header (http/https) or nextUrl.protocol (which may include colon)
  const isHttp = (forwardedProto === "http") || (typeof nextProto === "string" && nextProto.startsWith("http:"));

  // Redirect HTTP -> HTTPS in production, or when FORCE_HTTPS=true (useful for local testing)
  const force = process.env.FORCE_HTTPS === "true";
  if (isHttp && (process.env.NODE_ENV === "production" || force)) {
    const url = req.nextUrl.clone();
    url.protocol = "https";
    // Allow configurable redirect status (default 302). In production you may want 301.
    const status = parseInt(process.env.REDIRECT_STATUS || "302", 10) || 302;
    return NextResponse.redirect(url, status);
  }

  const res = NextResponse.next();

  // Add common security headers unless explicitly disabled
  if (process.env.SECURE_HEADERS !== "false") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
    res.headers.set("Permissions-Policy", "geolocation=(), microphone=()");
    res.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
