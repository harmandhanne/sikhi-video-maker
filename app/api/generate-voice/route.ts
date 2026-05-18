import { NextResponse } from "next/server";
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";

export async function POST(req: Request) {
  const { scenes } = await req.json();

  const jobId = crypto.randomUUID();
  const exportsDir = path.join(process.cwd(), "public", "exports");

  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const audioName = `${jobId}.mp3`;
  const audioPath = path.join(exportsDir, audioName);
  const textPath = path.join(exportsDir, `${jobId}.txt`);

  const voiceText = Array.isArray(scenes) ? scenes.join(". ") : "";

  fs.writeFileSync(textPath, voiceText, "utf-8");

  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  const voiceResult = spawnSync(pythonCmd, [
    "-m",
    "edge_tts",
    "--voice",
    "en-US-AndrewNeural",
    "--file",
    textPath,
    "--write-media",
    audioPath,
  ]);

  fs.unlink(textPath, () => {});

  if (voiceResult.status !== 0) {
    console.error(voiceResult.stderr?.toString());
    return NextResponse.json({ error: "Voice failed" }, { status: 500 });
  }

  const metadata = await parseFile(audioPath);
const audioDuration = metadata.format.duration || 30;

  return NextResponse.json({
    audioUrl: `/exports/${audioName}`,
    audioFileName: audioName,
    videoLength: Math.ceil(audioDuration),
  });
}