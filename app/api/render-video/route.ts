import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
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

  renderJobs.set(jobId, {
    id: jobId,
    progress: 0,
    status: "rendering",
  });

const scriptPath = path.join(
  process.cwd(),
  "scripts",
  "render-video.mjs"
);

const propsPath = path.join(exportsDir, `${jobId}.json`);

fs.writeFileSync(propsPath, JSON.stringify(inputProps), "utf-8");

const child = spawn("node", [
  scriptPath,
  propsPath,
  outputPath,
]);

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