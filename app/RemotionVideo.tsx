import { Audio, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoFrame } from "./VideoFrame";
import { getSceneTiming } from "./videoTiming";
import type { BackgroundAsset } from "./backgroundAsset";

export function RemotionVideo({
  scenes,
  videoTag = "",
  videoLength = 30,
backgroundAsset = null,
useOriginalBackgroundSound = false,
videoSize = "9:16",
audioUrl = null,
sceneDurations = [],
}: {
  scenes: string[];
  videoTag?: string;
  videoLength?: number;
backgroundAsset?: BackgroundAsset | null;
useOriginalBackgroundSound?: boolean;
videoSize?: string;
audioUrl?: string | null;
sceneDurations?: number[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const safeScenes = scenes.length > 0 ? scenes : [""];
  const totalFrames = videoLength * fps;

const { currentScene, progress } = getSceneTiming({
  scenes: safeScenes,
  totalFrames,
  frame,
  sceneDurations,
  fps,
});
  const elapsedTime = Math.floor(frame / fps);

return (
  <>
    {audioUrl && <Audio src={audioUrl} />}

    <VideoFrame
  scenes={safeScenes}
  currentScene={currentScene}
  progress={progress}
  elapsedTime={elapsedTime}
  backgroundAsset={backgroundAsset}
useOriginalBackgroundSound={useOriginalBackgroundSound && !audioUrl}
  videoSize={videoSize}
  videoLength={videoLength}
  videoTag={videoTag}
fps={fps}
mode="export"
    />
  </>
);
}