// import { NextResponse } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCookieOptions } from "@/lib/security";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function POST(req: Request) {
  try {
    const { email, password, role, setSession } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "viewer",
      },
    });

    const res = NextResponse.json({ message: "User created successfully", user: newUser });

    // Optionally set a session cookie on registration if client requests it
    if (setSession) {
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET || "", { expiresIn: "7d" });
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

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
