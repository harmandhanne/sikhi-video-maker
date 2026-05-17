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
}: {
  scenes: string[];
  backgroundImage: string | null;
  videoSize: string;
  videoLength: number;
  videoTag: string;
}) {
  const fps = 30;
  const safeScenes = scenes.length > 0 ? scenes : [""];
  const totalFrames = videoLength * fps;

  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);

    const timer = setInterval(() => {
      setFrame((prev) => {
if (prev >= totalFrames - 1) return 0;
return prev + 1;
      });
    }, 1000 / fps);

    return () => clearInterval(timer);
  }, [scenes, videoLength, totalFrames]);

  const { currentScene, progress } = getSceneTiming({
    scenes: safeScenes,
    totalFrames,
    frame,
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