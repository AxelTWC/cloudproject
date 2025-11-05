import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCookieOptions } from "@/lib/security";

const SECRET = process.env.JWT_SECRET || "my_super_secret_key";

export async function POST(req: Request) {
  const data = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }


  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "1h",
  });

  const res = NextResponse.json({ message: "Login successful" });
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

  return res;
}
