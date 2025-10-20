import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { fileId, name } = await req.json();
    const tag = await prisma.tag.create({ data: { fileId, name } });
    return NextResponse.json(tag);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add tag" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const tags = await prisma.tag.findMany();
  return NextResponse.json(tags);
}
