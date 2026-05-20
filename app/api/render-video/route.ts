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

  const selectedVoice =
    inputProps.voiceGender === "female"
      ? "en-US-AriaNeural"
      : "en-US-AndrewNeural";

  console.log("Export voice:", selectedVoice);

  const safeScenes = Array.isArray(inputProps.scenes)
    ? inputProps.scenes.map((scene: string) => String(scene).trim()).filter(Boolean)
    : [];

  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  const sceneAudioPaths: string[] = [];
  const tempFiles: string[] = [];
  const sceneDurations: number[] = [];

  const cleanupFiles = (files: string[]) => {
    for (const file of files) {
      fs.unlink(file, () => {});
    }
  };

  const concatPath = (filePath: string) => {
    return filePath.replace(/\\/g, "/").replace(/'/g, "'\\''");
  };

  try {
    for (let i = 0; i < safeScenes.length; i++) {
      const textPath = path.join(exportsDir, `${jobId}-${i}.txt`);
      const sceneAudioPath = path.join(exportsDir, `${jobId}-${i}.mp3`);

      tempFiles.push(textPath);
      sceneAudioPaths.push(sceneAudioPath);

      fs.writeFileSync(textPath, safeScenes[i], "utf-8");

      const voiceResult = spawnSync(pythonCmd, [
        "-m",
        "edge_tts",
        "--voice",
        selectedVoice,
        "--file",
        textPath,
        "--write-media",
        sceneAudioPath,
      ]);

      fs.unlink(textPath, () => {});

      if (voiceResult.status !== 0) {
        throw new Error(voiceResult.stderr?.toString() || "Voice failed");
      }

      const metadata = await parseFile(sceneAudioPath);
      sceneDurations.push(metadata.format.duration || 1);
    }

    if (sceneAudioPaths.length === 1) {
      fs.copyFileSync(sceneAudioPaths[0], audioPath);
    } else {
      const listPath = path.join(exportsDir, `${jobId}-concat.txt`);
      tempFiles.push(listPath);

      fs.writeFileSync(
        listPath,
        sceneAudioPaths
          .map((filePath) => `file '${concatPath(filePath)}'`)
          .join("\n"),
        "utf-8"
      );

      const concatResult = spawnSync("ffmpeg", [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listPath,
        "-c:a",
        "libmp3lame",
        "-b:a",
        "192k",
        audioPath,
      ]);

      if (concatResult.status !== 0) {
        throw new Error(
          concatResult.stderr?.toString() || "Audio combine failed"
        );
      }
    }

    const metadata = await parseFile(audioPath);
    const audioDuration =
      metadata.format.duration ||
      sceneDurations.reduce((a, b) => a + b, 0) ||
      inputProps.videoLength;

    inputProps.sceneDurations = sceneDurations;
    inputProps.audioFileName = audioName;
    inputProps.audioUrl = `${baseUrl}/api/download-video/${audioName}`;
    inputProps.videoLength = Math.ceil(audioDuration);

    cleanupFiles([...sceneAudioPaths, ...tempFiles]);
  } catch (error) {
    console.error(error);

    cleanupFiles([...sceneAudioPaths, ...tempFiles, audioPath]);

    inputProps.audioFileName = null;
    inputProps.audioUrl = null;
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