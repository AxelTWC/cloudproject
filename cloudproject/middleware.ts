import { NextRequest, NextResponse } from "next/server";

// Global middleware to enforce HTTPS (in production) and set secure headers.
export function middleware(req: NextRequest) {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const nextProto = req.nextUrl && req.nextUrl.protocol; 


  const isHttp = (forwardedProto === "http") || (typeof nextProto === "string" && nextProto.startsWith("http:"));


  const disableRedirect = process.env.DISABLE_HTTPS_REDIRECT === "true";
  const force = process.env.FORCE_HTTPS === "true";
  
  if (isHttp && !disableRedirect && (process.env.NODE_ENV === "production" || force)) {
    const url = req.nextUrl.clone();
    url.protocol = "https";
    const status = parseInt(process.env.REDIRECT_STATUS || "302", 10) || 302;
    return NextResponse.redirect(url, status);
  }

  const res = NextResponse.next();

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