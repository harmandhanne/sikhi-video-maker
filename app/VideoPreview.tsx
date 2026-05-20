"use client";

import { useEffect, useState } from "react";
import { VideoFrame } from "./VideoFrame";
import { getSceneTiming } from "./videoTiming";

export function VideoPreview({
  scenes,
  backgroundImage,
  videoSize,
  videoLength,
videoTag,
isPlaying = true,
resetKey = 0,
sceneDurations,
}: {
  scenes: string[];
  backgroundImage: string | null;
  videoSize: string;
  videoLength: number;
videoTag: string;
isPlaying?: boolean;
resetKey?: number;
sceneDurations?: number[];
}) {
  const fps = 30;
  const safeScenes = scenes.length > 0 ? scenes : [""];
  const totalFrames = videoLength * fps;

  const [frame, setFrame] = useState(0);

useEffect(() => {
  setFrame(0);
}, [scenes, videoLength, totalFrames, resetKey]);

useEffect(() => {
  if (!isPlaying) return;

  const timer = setInterval(() => {
    setFrame((prev) => {
      if (prev >= totalFrames - 1) return prev;
      return prev + 1;
    });
  }, 1000 / fps);

  return () => clearInterval(timer);
}, [isPlaying, totalFrames]);

const { currentScene, progress } = getSceneTiming({
  scenes: safeScenes,
  totalFrames,
  frame,
  sceneDurations,
});

  const elapsedTime = Math.floor(frame / fps);

  return (
<VideoFrame
  scenes={safeScenes}
  currentScene={currentScene}
  progress={progress}
  elapsedTime={elapsedTime}
  backgroundImage={backgroundImage}
  videoSize={videoSize}
  videoLength={videoLength}
  videoTag={videoTag}
  mode="preview"
/>
  );
}