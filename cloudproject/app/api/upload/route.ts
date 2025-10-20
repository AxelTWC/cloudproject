import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

    const filename = file.name;

    const latestFile = await prisma.file.findFirst({
      where: { filename, ownerId: userId },
      orderBy: { version: "desc" },
    });
    const newVersion = latestFile ? latestFile.version + 1 : 1;

    const timestamp = Date.now();
    const savedFilename = `${timestamp}-${filename}`;
    const filePath = path.join(UPLOAD_DIR, savedFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const dbFile = await prisma.file.create({
      data: {
        filename,
        url: `/uploads/${savedFilename}`,
        version: newVersion,
        ownerId: userId,
      },
    });

    return NextResponse.json(dbFile);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
