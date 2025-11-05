import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

    // Find all versions to ensure we don't duplicate version numbers
    const allVersions = await prisma.file.findMany({ 
      where: { filename, ownerId: userId },
      orderBy: { version: 'desc' }
    });

    // Get the target version we want to restore
    const target = allVersions.find(f => f.version === version);
    if (!target) return NextResponse.json({ error: 'version not found' }, { status: 404 });

    // Shift all versions after the target down by one to make room
    const updates = allVersions
      .filter(f => f.version > version)
      .map(f => prisma.file.update({
        where: { id: f.id },
        data: { version: f.version + 1 }
      }));
    
    // Create a new version with the target's content at version + 1
    updates.push(
      prisma.file.create({
        data: {
          filename,
          url: target.url,
          version: version + 1,
          ownerId: userId
        }
      })
    );

    // Execute all updates in a transaction
    const [restored] = await prisma.$transaction(updates.reverse());

    return NextResponse.json(restored);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
