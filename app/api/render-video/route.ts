import { NextResponse } from "next/server";
import { spawn, spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";
import { renderJobs } from "../render-jobs";

export async function POST(req: Request) {
  const inputProps = await req.json();

  const jobId = crypto.randomUUID();
  const outputName = `${jobId}.mp4`;

  const exportsDir = path.join(process.cwd(), "public", "exports");

  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const outputPath = path.join(exportsDir, outputName);
  const protocol = req.headers.get("x-forwarded-proto") || "http";
const host = req.headers.get("host");

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (host ? `${protocol}://${host}` : "http://localhost:3000");

if (inputProps.useVoice) {
  const audioName = `${jobId}.mp3`;
  const audioPath = path.join(exportsDir, audioName);
  const textPath = path.join(exportsDir, `${jobId}.txt`);

  const voiceText = Array.isArray(inputProps.scenes)
    ? inputProps.scenes.join(". ")
    : "";

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
  inputProps.audioFileName = null;
  inputProps.audioUrl = null;
} else {
    const metadata = await parseFile(audioPath);
const audioDuration = metadata.format.duration || inputProps.videoLength;

  inputProps.audioFileName = audioName;
inputProps.audioUrl = `${baseUrl}/api/download-video/${audioName}`;
inputProps.videoLength = Math.ceil(audioDuration);
  }
} else {
  inputProps.audioFileName = null;
inputProps.audioUrl = null;
}

  renderJobs.set(jobId, {
    id: jobId,
    progress: 0,
    status: "rendering",
  });

const scriptPath = path.join("scripts", "render-video.mjs");

const propsPath = path.join(exportsDir, `${jobId}.json`);

fs.writeFileSync(propsPath, JSON.stringify(inputProps), "utf-8");

const child = spawn(process.execPath, [
  scriptPath,
  propsPath,
  outputPath,
], {
  cwd: process.cwd(),
});

  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);

        if (parsed.type === "progress") {
          const job = renderJobs.get(jobId);

          if (job) {
            job.progress = parsed.progress;
            renderJobs.set(jobId, job);
          }
        }
      } catch {}
    }
  });

  child.stderr.on("data", (data) => {
    console.error(data.toString());
  });

child.on("close", (code) => {
  fs.unlink(propsPath, () => {});
  fs.unlink(path.join(exportsDir, `${jobId}.mp3`), () => {});

  const job = renderJobs.get(jobId);

    if (!job) return;

    if (code === 0) {
      renderJobs.set(jobId, {
        ...job,
        progress: 100,
        status: "done",
        downloadUrl: `/api/download-video/${outputName}`,
      });

      setTimeout(() => {
        fs.unlink(outputPath, (err) => {
          if (err) {
            console.error("Delete failed:", err);
          } else {
            console.log(`Deleted old export: ${outputName}`);
          }
        });
      }, 1000 * 60 * 10);
    } else {
      renderJobs.set(jobId, {
        ...job,
        status: "error",
        error: "Render failed",
      });
    }
  });

  return NextResponse.json({ jobId });
}