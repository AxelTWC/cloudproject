export function getCookieOptions() {
  const secure = (process.env.COOKIE_SECURE === "true") || process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    sameSite: "lax" as const,
    secure,
  };
}

export const defaultSecurityHeaders: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer-when-downgrade",
  "Permissions-Policy": "geolocation=(), microphone=()",
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
};
