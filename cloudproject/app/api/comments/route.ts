import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { fileId, text } = await req.json();
    if (!text) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

    const comment = await prisma.comment.create({
      data: {
        fileId,
        text,
      },
    });

    return NextResponse.json(comment);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
