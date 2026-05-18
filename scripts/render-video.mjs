import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import fs from "fs";

const propsPath = process.argv[2];
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf-8"));
const outputPath = process.argv[3];

const bundleLocation = await bundle({
  entryPoint: path.resolve(process.cwd(), "entry.ts"),
});

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "SikhiVideo",
  inputProps,
});

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  imageFormat: "png",
  outputLocation: outputPath,
  inputProps,
  concurrency: 1,
  jpegQuality: 75,
    onProgress: ({ progress }) => {
    console.log(
      JSON.stringify({
        type: "progress",
        progress: Math.round(progress * 100),
      })
    );
  },
});

console.log(outputPath);