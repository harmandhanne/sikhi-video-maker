import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();

  const exportsDir = path.join(process.cwd(), "public", "exports");

  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const fileName = `video-${Date.now()}.mp4`;
  const outputPath = path.join(exportsDir, fileName);

  const { execFile } = await import("node:child_process");

  const scriptPath =
    process.cwd().replace(/\\/g, "/") +
    "/scripts/render-video.mjs";

  await new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [
        scriptPath,
        JSON.stringify(body),
        outputPath,
      ],
      { cwd: process.cwd() },
      (error) => {
        if (error) reject(error);
        else resolve(true);
      }
    );
  });

  return NextResponse.json({
    success: true,
    downloadUrl: `/exports/${fileName}`,
  });
}