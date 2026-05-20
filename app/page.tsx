"use client";

import { useRef, useState } from "react";
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
const [isRendering, setIsRendering] = useState(false);
const [renderProgress, setRenderProgress] = useState(0);
const [downloadUrl, setDownloadUrl] = useState("");
const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
const [previewAudioUrl, setPreviewAudioUrl] = useState("");
const [voiceVideoLength, setVoiceVideoLength] = useState<number | null>(null);
const [voiceSceneDurations, setVoiceSceneDurations] = useState<number[]>([]);
const [useVoice, setUseVoice] = useState(false);
const [voiceGender, setVoiceGender] = useState<"male" | "female">("male");
const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
const [previewStartKey, setPreviewStartKey] = useState(0);
const [showPreviewIcon, setShowPreviewIcon] = useState(true);
const [previewSyncedTime, setPreviewSyncedTime] = useState<number | null>(null);
const previewSyncFrameRef = useRef<number | null>(null);
const previewIconTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const audioRef = useRef<HTMLAudioElement | null>(null);

async function generateScenes() {
  setIsGeneratingVideo(true);

  try {
    const parts = script
      .split(/[.!?]/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

setScenes(parts);
setVoiceSceneDurations([]);
setPreviewSyncedTime(null);

if (previewSyncFrameRef.current !== null) {
  cancelAnimationFrame(previewSyncFrameRef.current);
  previewSyncFrameRef.current = null;
}

    const res = await fetch("/api/generate-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
body: JSON.stringify({
  scenes: parts,
}),
    });

    const data = await res.json();
    setPrompts(data.prompts);

    if (useVoice) {
      setIsGeneratingVoice(true);
      setIsPreviewPlaying(false);
      setPreviewAudioUrl("");
      setVoiceVideoLength(null);

      const voiceRes = await fetch("/api/generate-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  scenes: parts,
  voiceGender,
}),
      });

      const voiceData = await voiceRes.json();

      setPreviewAudioUrl(`${voiceData.audioUrl}?t=${Date.now()}`);
      setVoiceVideoLength(voiceData.videoLength);
      setVoiceSceneDurations(voiceData.sceneDurations || []);
      setIsGeneratingVoice(false);
    } else {
      setPreviewAudioUrl("");
setVoiceVideoLength(null);
setVoiceSceneDurations([]);
setIsPreviewPlaying(false);
    }
  } catch (error) {
    console.error(error);
    alert("Video generation failed");
  } finally {
    setIsGeneratingVideo(false);
  }
}
  

const finalVideoLength =
  useVoice && voiceVideoLength
    ? voiceVideoLength
    : videoLength === 999
    ? Number(customLength || 30)
    : videoLength;

const sceneDurations =
  useVoice && voiceSceneDurations.length > 0
    ? voiceSceneDurations.map((duration) =>
        Math.max(1, Math.round(duration))
      )
    : getSceneDurations({
        scenes,
        videoLength: finalVideoLength,
      });
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-10">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-5xl font-bold text-center">Video Maker</h1>

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
const img = new Image();

img.onload = () => {
const maxWidth =
  videoSize === "16:9" ? 1920 : 1080;

const maxHeight =
  videoSize === "16:9" ? 1080 : videoSize === "1:1" ? 1080 : 1920;

  const scale = Math.min(
    maxWidth / img.width,
    maxHeight / img.height,
    1
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

const resizedImage = canvas.toDataURL("image/jpeg", 0.97);

  setBackgroundImage(resizedImage);
};

img.src = URL.createObjectURL(file);
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

{!useVoice && (
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
)}

<input
  type="text"
  placeholder="Video tag"
  value={videoTag}
  onChange={(e) => setVideoTag(e.target.value)}
  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700"
/>

{!useVoice && videoLength === 999 && (
  <input
    type="number"
    placeholder="Enter custom seconds"
    value={customLength}
    onChange={(e) => setCustomLength(e.target.value)}
    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700"
  />
)}

<label className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-700">
<input
  type="checkbox"
  checked={useVoice}
  onChange={(e) => {
    setUseVoice(e.target.checked);
    setPreviewAudioUrl("");
    setVoiceVideoLength(null);
    setVoiceSceneDurations([]);
    setPreviewSyncedTime(null);
    setIsPreviewPlaying(false);

    if (previewSyncFrameRef.current !== null) {
      cancelAnimationFrame(previewSyncFrameRef.current);
      previewSyncFrameRef.current = null;
    }
  }}
/>
  <span>Use voice and auto-match video length</span>
</label>

{useVoice && (
  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 space-y-3">
    <p className="font-bold">Choose voice</p>

    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => setVoiceGender("male")}
        className={`py-3 rounded-xl font-bold ${
          voiceGender === "male"
            ? "bg-yellow-400 text-black"
            : "bg-zinc-800 text-white"
        }`}
      >
        Male
      </button>

      <button
        type="button"
        onClick={() => setVoiceGender("female")}
        className={`py-3 rounded-xl font-bold ${
          voiceGender === "female"
            ? "bg-yellow-400 text-black"
            : "bg-zinc-800 text-white"
        }`}
      >
        Female
      </button>
    </div>
  </div>
)}

<button
  onClick={generateScenes}
  disabled={isGeneratingVideo}
  className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:opacity-80 disabled:opacity-50"
>
  {isGeneratingVideo ? (
    <span className="flex items-center justify-center gap-3">
      <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      Generating Video...
    </span>
  ) : (
    "Generate Video"
  )}
</button>

<button
  disabled={isRendering}
  className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-lg hover:opacity-80 disabled:opacity-50"
  onClick={async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setDownloadUrl("");

try {
  const res = await fetch("/api/render-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
body: JSON.stringify({
  scenes,
  videoLength: finalVideoLength,
  videoSize,
  videoTag,
  backgroundImage,
  useVoice,
  voiceGender,
  sceneDurations: useVoice ? voiceSceneDurations : undefined,
}),
  });

  const data = await res.json();

  const jobId = data.jobId;

  const interval = setInterval(async () => {
    const progressRes = await fetch(
      `/api/render-progress/${jobId}`
    );

    const progressData = await progressRes.json();

    setRenderProgress(progressData.progress);

    if (progressData.status === "done") {
      clearInterval(interval);

      setRenderProgress(100);
      setDownloadUrl(progressData.downloadUrl);

      const a = document.createElement("a");

a.href = `${progressData.downloadUrl}?t=${Date.now()}`;

a.download = `sikhi-video-${Date.now()}.mp4`;

document.body.appendChild(a);

a.click();

setTimeout(() => {
  a.remove();
}, 1000);

      setTimeout(() => {
        setIsRendering(false);
        setRenderProgress(0);
      }, 1200);
    }

    if (progressData.status === "error") {
      clearInterval(interval);

      alert("Render failed");

      setIsRendering(false);
    }
  }, 1000);
} catch (error) {
  console.error(error);
  alert("Render failed to start");
  setIsRendering(false);
}
  }}
>
  {isRendering ? "Rendering..." : "Export MP4"}
</button>

{isRendering && (
  <div className="w-full space-y-3">
    <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-yellow-400 transition-all duration-500"
        style={{ width: `${renderProgress}%` }}
      />
    </div>

    <p className="text-center text-sm text-zinc-400">
      Rendering video... {renderProgress}%
    </p>
  </div>
)}

{downloadUrl && (
  <a
    href={downloadUrl}
    download
    target="_blank"
    className="block w-full bg-green-500 text-black py-4 rounded-xl font-bold text-lg text-center"
  >
    Download Video
  </a>
)}

{useVoice && isGeneratingVoice && (
  <div className="w-full flex justify-center py-10">
    <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
  </div>
)}

{scenes.length > 0 && (!useVoice || previewAudioUrl) && (
  <div className="relative mx-auto" style={{ width: "fit-content" }}>
    {useVoice && previewAudioUrl && (
<audio
  ref={audioRef}
  src={previewAudioUrl}
  onEnded={() => {
    setIsPreviewPlaying(false);
    setShowPreviewIcon(true);

    if (previewSyncFrameRef.current !== null) {
      cancelAnimationFrame(previewSyncFrameRef.current);
      previewSyncFrameRef.current = null;
    }
  }}
  className="hidden"
/>
    )}

<VideoPreview
  scenes={scenes}
  backgroundImage={backgroundImage}
  videoSize={videoSize}
  videoLength={finalVideoLength}
  videoTag={videoTag}
  isPlaying={!useVoice || isPreviewPlaying}
  resetKey={previewStartKey}
  sceneDurations={useVoice ? voiceSceneDurations : undefined}
syncedTime={useVoice ? previewSyncedTime : null}
/>

    {useVoice && previewAudioUrl && (
      <button
        className={`absolute inset-0 flex items-center justify-center rounded-[30px] z-20 p-0 border-0 ${
  showPreviewIcon || !isPreviewPlaying ? "bg-black/20" : "bg-transparent"
}`}
onClick={async () => {
  if (!audioRef.current) return;

  if (previewIconTimeoutRef.current) {
    clearTimeout(previewIconTimeoutRef.current);
  }

if (isPreviewPlaying) {
  audioRef.current.pause();
  setIsPreviewPlaying(false);
  setShowPreviewIcon(true);

  if (previewSyncFrameRef.current !== null) {
    cancelAnimationFrame(previewSyncFrameRef.current);
    previewSyncFrameRef.current = null;
  }

  return;
}
audioRef.current.currentTime = 0;
setPreviewSyncedTime(0);
setPreviewStartKey((prev) => prev + 1);
setIsPreviewPlaying(true);
setShowPreviewIcon(true);

await audioRef.current.play();

const syncPreviewToAudio = () => {
  if (!audioRef.current) return;

  setPreviewSyncedTime(audioRef.current.currentTime);

  previewSyncFrameRef.current =
    requestAnimationFrame(syncPreviewToAudio);
};

syncPreviewToAudio();

  previewIconTimeoutRef.current = setTimeout(() => {
    setShowPreviewIcon(false);
  }, 1000);
}}
      >
{showPreviewIcon && (
  <span className="w-20 h-20 rounded-full bg-yellow-400/90 text-[#fefcfc] flex items-center justify-center text-4xl font-bold shadow-lg">
    {isPreviewPlaying ? "❚❚" : "▶"}
  </span>
)}
      </button>
    )}
  </div>
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