import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { deleteFile } from '@/lib/storage';

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/token=([^;]+)/);
    if (!tokenMatch) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const token = tokenMatch[1];

    let payload: { userId: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = payload.userId;

    const body = await req.json();
    const { filename, version } = body;
    if (!filename || typeof version !== 'number') return NextResponse.json({ error: 'filename and version required' }, { status: 400 });

    const target = await prisma.file.findFirst({ where: { filename, ownerId: userId, version } });
    if (!target) return NextResponse.json({ error: 'version not found' }, { status: 404 });

    // delete related tags and comments first to avoid foreign key constraint errors
    const [tagDel, commentDel, deleted] = await prisma.$transaction([
      prisma.tag.deleteMany({ where: { fileId: target.id } }),
      prisma.comment.deleteMany({ where: { fileId: target.id } }),
      prisma.file.delete({ where: { id: target.id } }),
    ]);

    // attempt to delete the underlying storage object (best-effort)
    try {
      if (target.url) {
        await deleteFile(target.url);
      }
    } catch (err) {
      // Log and continue; DB entry(s) were removed above so the file will no longer be visible.
      console.error('Storage deletion failed for', target.url, err);
    }

    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
