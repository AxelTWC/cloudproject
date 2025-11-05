import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCookieOptions } from "@/lib/security";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log("Received body:", data);

  if (!data.email || !data.password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { email: data.email, password: hashed },
  });

  const res = NextResponse.json(user);

  // Optionally set session cookie if client requests it
  try {
    const body = await req.json();
    if (body.setSession) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET || "", { expiresIn: "7d" });
      const cookieOpts = getCookieOptions();
      res.cookies.set({
        name: "token",
        value: token,
        httpOnly: cookieOpts.httpOnly,
        path: cookieOpts.path,
        maxAge: cookieOpts.maxAge,
        sameSite: cookieOpts.sameSite,
        secure: cookieOpts.secure,
      });
    }
  } catch (e) {
    // ignore JSON parsing errors for optional behavior
  }

  return res;
}
  