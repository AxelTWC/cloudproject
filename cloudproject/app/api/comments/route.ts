import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { fileId, text } = await req.json();

    if (!fileId || !text) {
      return NextResponse.json({ error: 'Missing fileId or text' }, { status: 400 });
    }

    // Check if the file belongs to the user
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.ownerId !== parseInt(decoded.userId, 10)) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        fileId,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const body = await req.json();

    // delete single comment by id
    if (body.id) {
      const comment = await prisma.comment.findUnique({ where: { id: body.id } });
      if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      const file = await prisma.file.findUnique({ where: { id: comment.fileId } });
      if (!file || file.ownerId !== parseInt(decoded.userId, 10)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      await prisma.comment.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }

    // delete all comments for a fileId
    if (body.fileId && body.all) {
      const file = await prisma.file.findUnique({ where: { id: body.fileId } });
      if (!file || file.ownerId !== parseInt(decoded.userId, 10)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      await prisma.comment.deleteMany({ where: { fileId: body.fileId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Comment delete error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
