import { Composition } from "remotion";
import { RemotionVideo } from "./app/RemotionVideo";

export default function Root() {
  return (
    <Composition
      id="SikhiVideo"
      component={RemotionVideo}
      durationInFrames={120}
      fps={24}
      width={720}
      height={1280}
      defaultProps={{
        scenes: ["Your video will appear here"],
        videoLength: 5,
        videoTag: "@singhmotivation",
      }}
      calculateMetadata={({ props }) => {
        const fps = 24;
        const videoLength = props.videoLength || 5;

        return {
          durationInFrames: Math.max(1, Math.round(videoLength * fps)),
        };
      }}
    />
  );
}