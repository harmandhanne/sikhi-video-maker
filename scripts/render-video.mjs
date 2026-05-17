import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputProps = JSON.parse(process.argv[2]);
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
  outputLocation: outputPath,
  inputProps,
});

console.log(outputPath);