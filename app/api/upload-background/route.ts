import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { spawnSync } from "child_process";

export const runtime = "nodejs";

const allowedTypes: Record<string, "image" | "video"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
};

function getExtension(fileName: string, mimeType: string) {
  const ext = path.extname(fileName).toLowerCase();

  if (ext) return ext;
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "video/mp4") return ".mp4";
  if (mimeType === "video/webm") return ".webm";
  if (mimeType === "video/quicktime") return ".mov";

  return "";
}

function getVideoDurationSeconds(filePath: string) {
  const result = spawnSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);

  if (result.status !== 0) return undefined;

  const duration = Number(result.stdout.toString().trim());

  return Number.isFinite(duration) && duration > 0 ? duration : undefined;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const assetType = allowedTypes[file.type];

    if (!assetType) {
      return NextResponse.json(
        { error: "Only images and videos are allowed" },
        { status: 400 }
      );
    }

    const maxSize =
      assetType === "video" ? 250 * 1024 * 1024 : 25 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json({ error: "File is too large" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = getExtension(file.name, file.type);
    const fileName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

const asset = {
  type: assetType,
  url: `/api/uploads/${fileName}`,
  duration:
    assetType === "video" ? getVideoDurationSeconds(filePath) : undefined,
  originalName: file.name,
  mimeType: file.type,
};

setTimeout(() => {
  fs.unlink(filePath).catch((error) => {
    if (error?.code !== "ENOENT") {
      console.error("Background cleanup failed:", error);
    }
  });
}, 1000 * 60 * 30);

return NextResponse.json({ asset });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}