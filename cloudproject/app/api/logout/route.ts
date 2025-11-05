import { NextResponse } from "next/server";
import { getCookieOptions } from "@/lib/security";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  const cookieOpts = getCookieOptions();
  // Clear the token cookie by setting it empty and maxAge=0
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: cookieOpts.httpOnly,
    path: cookieOpts.path,
    maxAge: 0,
    sameSite: cookieOpts.sameSite,
    secure: cookieOpts.secure,
  });

  return res;
}
