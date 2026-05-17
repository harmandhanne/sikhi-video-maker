import { Composition } from "remotion";
import { RemotionVideo } from "./app/RemotionVideo";

export default function Root() {
  return (
    <Composition
      id="SikhiVideo"
      component={RemotionVideo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
defaultProps={{
  scenes: ["Your video will appear here"],
  videoTag: "@singhmotivation",
}}
    />
  );
}