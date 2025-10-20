import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filename = url.pathname.split("/").pop();

  if (!filename) {
    return NextResponse.json({ error: "Filename not provided" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
