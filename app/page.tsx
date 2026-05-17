"use client";

import { useState } from "react";
import { VideoPreview } from "./VideoPreview";
import { getSceneDurations } from "./videoTiming";


export default function Home() {
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState("9:16");
  const [videoLength, setVideoLength] = useState(30);
const [customLength, setCustomLength] = useState("");
const [videoTag, setVideoTag] = useState("singhmotivation");

  async function generateScenes() {
    const parts = script
      .split(/[.!?]/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setScenes(parts);

    const res = await fetch("/api/generate-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenes: parts }),
    });

    const data = await res.json();
    setPrompts(data.prompts);
  }

  const finalVideoLength =
  videoLength === 999 ? Number(customLength || 30) : videoLength;

const sceneDurations = getSceneDurations({
  scenes,
  videoLength: finalVideoLength,
});

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-10">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-5xl font-bold text-center">Sikhi Video Maker</h1>

        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Paste your script here..."
          className="w-full h-64 p-4 rounded-xl bg-zinc-900 border border-zinc-700 outline-none"
        />

        <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(null);
    }
  }}
  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700"
/>

<select
  value={videoSize}
  onChange={(e) => setVideoSize(e.target.value)}
  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700"
>
  <option value="9:16">TikTok 9:16</option>
  <option value="1:1">Instagram 1:1</option>
  <option value="16:9">YouTube 16:9</option>
</select>

<select
  value={videoLength}
  onChange={(e) => setVideoLength(Number(e.target.value))}
  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700"
>
  <option value={15}>15 Seconds</option>
  <option value={30}>30 Seconds</option>
  <option value={60}>60 Seconds</option>
  <option value={999}>Custom</option>
</select>

<input
  type="text"
  placeholder="Video tag"
  value={videoTag}
  onChange={(e) => setVideoTag(e.target.value)}
  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700"
/>

{videoLength === 999 && (
  <input
    type="number"
    placeholder="Enter custom seconds"
    value={customLength}
    onChange={(e) => setCustomLength(e.target.value)}
    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700"
  />
)}

        <button
          onClick={generateScenes}
          className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:opacity-80"
        >
          Generate Video
        </button>

        <button
  className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-lg hover:opacity-80"
  onClick={async () => {
const res = await fetch("/api/render-video", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    scenes,
    videoLength:
      videoLength === 999
        ? Number(customLength || 30)
        : videoLength,
    videoSize,
    videoTag,
  }),
});

const data = await res.json();

window.open(data.downloadUrl, "_blank");
  }}
>
  Export MP4
</button>

        {scenes.length > 0 && (
<VideoPreview
  scenes={scenes}
  backgroundImage={backgroundImage}
  videoSize={videoSize}

  videoLength={
  videoLength === 999
    ? Number(customLength || 30)
    : videoLength
}
    videoTag={videoTag}

/>
)}

        {scenes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Scenes</h2>

            {scenes.map((scene, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 space-y-3"
              >
                <p className="text-sm text-zinc-400">Scene {index + 1}</p>
                <p>{scene}</p>

                <p className="text-green-400 text-sm">
  Duration: {sceneDurations[index]}s
</p>

                {prompts[index] && (
                  <p className="text-yellow-300 text-sm">
                    Prompt: {prompts[index]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}