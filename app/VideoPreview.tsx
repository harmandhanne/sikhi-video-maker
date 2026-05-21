"use client";

import { useEffect, useState } from "react";
import { VideoFrame } from "./VideoFrame";
import { getSceneTiming } from "./videoTiming";
import type { BackgroundAsset } from "./backgroundAsset";

export function VideoPreview({
  scenes,
  backgroundAsset,
  useOriginalBackgroundSound = false,
  videoSize,
  videoLength,
  videoTag,
  isPlaying = true,
  resetKey = 0,
  sceneDurations,
  syncedTime = null,
}: {
  scenes: string[];
  backgroundAsset: BackgroundAsset | null;
  useOriginalBackgroundSound?: boolean;
  videoSize: string;
  videoLength: number;
  videoTag: string;
  isPlaying?: boolean;
  resetKey?: number;
  sceneDurations?: number[];
  syncedTime?: number | null;
}) {
  const fps = 30;
  const safeScenes = scenes.length > 0 ? scenes : [""];
  const totalFrames = videoLength * fps;

  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
  }, [scenes, videoLength, totalFrames, resetKey]);

  useEffect(() => {
    if (syncedTime !== null) return;
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setFrame((prev) => {
        if (prev >= totalFrames - 1) return prev;
        return prev + 1;
      });
    }, 1000 / fps);

    return () => clearInterval(timer);
  }, [isPlaying, totalFrames, syncedTime]);

  useEffect(() => {
    if (syncedTime === null) return;

    setFrame(Math.min(totalFrames - 1, Math.floor(syncedTime * fps)));
  }, [syncedTime, totalFrames]);

  const { currentScene, progress } = getSceneTiming({
    scenes: safeScenes,
    totalFrames,
    frame,
    sceneDurations,
    fps,
  });

  const elapsedTime = Math.floor(frame / fps);

  return (
    <VideoFrame
      scenes={safeScenes}
      currentScene={currentScene}
      progress={progress}
      elapsedTime={elapsedTime}
      backgroundAsset={backgroundAsset}
      useOriginalBackgroundSound={useOriginalBackgroundSound}
      videoSize={videoSize}
      videoLength={videoLength}
      videoTag={videoTag}
      isPlaying={isPlaying}
resetKey={resetKey}
syncedTime={syncedTime}
mode="preview"
    />
  );
}