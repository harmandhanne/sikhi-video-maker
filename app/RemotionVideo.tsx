import { Audio, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoFrame } from "./VideoFrame";
import { getSceneTiming } from "./videoTiming";

export function RemotionVideo({
  scenes,
  videoTag = "",
  videoLength = 30,
  backgroundImage = null,
  videoSize = "9:16",
audioUrl = null,
sceneDurations = [],
}: {
  scenes: string[];
  videoTag?: string;
  videoLength?: number;
  backgroundImage?: string | null;
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
  backgroundImage={backgroundImage}
  videoSize={videoSize}
  videoLength={videoLength}
  videoTag={videoTag}
  mode="export"
    />
  </>
);
}