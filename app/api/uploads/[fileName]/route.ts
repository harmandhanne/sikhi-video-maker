import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileName: string }> }
) {
  const { fileName } = await params;

  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, fileName);
  const ext = path.extname(fileName).toLowerCase();

  try {
    const file = await fs.readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}