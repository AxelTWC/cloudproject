import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    const res = NextResponse.json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role,token } });
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true, 
      path: "/",      
      maxAge: 7 * 24 * 60 * 60, 
      sameSite: "lax", 
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
