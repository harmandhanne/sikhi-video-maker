import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(
  req: Request,
  context: { params: Promise<{ fileName: string }> }
) {
  const { fileName } = await context.params;

  const filePath = path.join(
    process.cwd(),
    "public",
    "exports",
    fileName
  );

  const file = await fs.readFile(filePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": file.length.toString(),
    },
  });
}