import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";


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
  
    return NextResponse.json(user);
  }
  