import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

    const filename = file.name;
    const latestFile = await prisma.file.findFirst({
      where: { filename, ownerId: parseInt(userId) },
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
        ownerId: parseInt(userId),
      },
    });

    return NextResponse.json(dbFile);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
