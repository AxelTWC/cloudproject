import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // TODO: 临时用测试 ID
  const userId = 1; 

  const files = await prisma.file.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      tags: true, 
    },
  });

  return NextResponse.json(files);
}
