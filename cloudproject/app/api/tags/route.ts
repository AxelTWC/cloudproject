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
    const { fileId, name } = await req.json();

    if (!fileId || !name) {
      return NextResponse.json({ error: 'Missing fileId or name' }, { status: 400 });
    }

    // Check if the file belongs to the user
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.ownerId !== parseInt(decoded.userId, 10)) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        fileId,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Tag creation error:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const tags = await prisma.tag.findMany({
      where: {
        file: {
          ownerId: parseInt(decoded.userId, 10)
        }
      },
      include: {
        file: true
      }
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Tag fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
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

    // delete single tag by id
    if (body.id) {
      const tag = await prisma.tag.findUnique({ where: { id: body.id } });
      if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      const file = await prisma.file.findUnique({ where: { id: tag.fileId } });
      if (!file || file.ownerId !== parseInt(decoded.userId, 10)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      await prisma.tag.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }

    // delete all tags for a fileId
    if (body.fileId && body.all) {
      const file = await prisma.file.findUnique({ where: { id: body.fileId } });
      if (!file || file.ownerId !== parseInt(decoded.userId, 10)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      await prisma.tag.deleteMany({ where: { fileId: body.fileId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Tag delete error:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
