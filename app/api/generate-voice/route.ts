import { NextResponse } from "next/server";
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";

function cleanupFiles(files: string[]) {
  for (const file of files) {
    fs.unlink(file, () => {});
  }
}

function concatPath(filePath: string) {
  return filePath.replace(/\\/g, "/").replace(/'/g, "'\\''");
}

export async function POST(req: Request) {
const { scenes, voiceGender = "male" } = await req.json();

const selectedVoice =
  voiceGender === "female"
    ? "en-US-AriaNeural"
    : "en-US-AndrewNeural";

  console.log("Preview voice:", selectedVoice);

  const safeScenes = Array.isArray(scenes)
    ? scenes.map((scene) => String(scene).trim()).filter(Boolean)
    : [];

  if (safeScenes.length === 0) {
    return NextResponse.json({ error: "No scenes" }, { status: 400 });
  }

  const jobId = crypto.randomUUID();
  const exportsDir = path.join(process.cwd(), "public", "exports");

  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const audioName = `${jobId}.mp3`;
  const audioPath = path.join(exportsDir, audioName);
  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  const sceneAudioPaths: string[] = [];
  const tempFiles: string[] = [];
  const sceneDurations: number[] = [];

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
"--rate=-5%",
"--pitch=+3Hz",
"--file",
textPath,
"--write-media",
sceneAudioPath,
      ]);

      fs.unlink(textPath, () => {});

      if (voiceResult.status !== 0) {
        console.error(voiceResult.stderr?.toString());
        cleanupFiles([...sceneAudioPaths, ...tempFiles, audioPath]);
        return NextResponse.json({ error: "Voice failed" }, { status: 500 });
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
        console.error(concatResult.stderr?.toString());
        cleanupFiles([...sceneAudioPaths, ...tempFiles, audioPath]);
        return NextResponse.json(
          { error: "Audio combine failed" },
          { status: 500 }
        );
      }
    }

    const metadata = await parseFile(audioPath);
    const audioDuration =
      metadata.format.duration ||
      sceneDurations.reduce((a, b) => a + b, 0) ||
      30;

    cleanupFiles([...sceneAudioPaths, ...tempFiles]);

    setTimeout(() => {
      fs.unlink(audioPath, () => {});
    }, 1000 * 60 * 10);

    return NextResponse.json({
      audioUrl: `/api/download-video/${audioName}`,
      audioFileName: audioName,
      videoLength: Math.ceil(audioDuration),
      sceneDurations,
    });
  } catch (error) {
    console.error(error);
    cleanupFiles([...sceneAudioPaths, ...tempFiles, audioPath]);
    return NextResponse.json({ error: "Voice failed" }, { status: 500 });
  }
}