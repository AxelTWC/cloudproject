import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";


export async function GET(req: Request) {
  try {
    
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = tokenMatch[1];

    
    let payload: { userId: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.userId;

    
    const files = await prisma.file.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        tags: true,
        comments: true,
      },
    });

    return NextResponse.json(files);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
