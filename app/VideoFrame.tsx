import { getSceneMood } from "./videoBackgrounds";

export function VideoFrame({
  scenes,
  currentScene,
  progress,
  elapsedTime,
  backgroundImage,
  videoSize,
  videoLength,
  videoTag,
mode = "preview",
}: {
  scenes: string[];
  currentScene: number;
  progress: number;
  elapsedTime: number;
  backgroundImage: string | null;
  videoSize: string;
videoLength: number;
videoTag: string;
mode?: "preview" | "export";
}) {
const exportStyle =
  videoSize === "1:1"
    ? { width: 720, height: 720 }
    : videoSize === "16:9"
    ? { width: 1280, height: 720 }
    : { width: 720, height: 1280 };

  const sceneText = scenes[currentScene] || "";
  const mood = getSceneMood(sceneText);

return (
  <div
    style={{
      ...(mode === "export"
        ? exportStyle
        : videoSize === "1:1"
        ? { width: 400, height: 400 }
        : videoSize === "16:9"
        ? { width: 500, height: 281 }
        : { width: 400, height: 711 }),

background:
  mood === "rain"
    ? "linear-gradient(to bottom, #0f172a, #020617, #1e293b)"
    : mood === "spiritual"
    ? "linear-gradient(to bottom, #1e3a8a, #020617, #0f766e)"
    : mood === "fire"
    ? "linear-gradient(to bottom, #7c2d12, #020617, #991b1b)"
    : mood === "stars"
    ? "linear-gradient(to bottom, #020617, #0f172a, #1e1b4b)"
    : mood === "golden"
    ? "linear-gradient(to bottom, #78350f, #020617, #92400e)"
    : "linear-gradient(to bottom, #172554, #000000, #18181b)",

      borderRadius: 30,
      overflow: "hidden",
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontFamily: "Arial",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 6,
        width: "100%",
        background: "rgba(255,255,255,0.2)",
      }}
    />

    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 6,
        width: `${progress}%`,
        background: "#facc15",
      }}
    />

{[...Array(mood === "rain" ? 12 : 8)].map((_, i) => (
  <div
    key={i}
    style={{
      position: "absolute",
      left: `${(i * 37) % 100}%`,
      top: `${((i * 29) + progress * (mood === "rain" ? 1.2 : 0.18)) % 100}%`,

transform:
  mood === "stars"
    ? `scale(${1 + Math.sin((progress + i * 10) / 15) * 0.35})`
    : mood === "fire" || mood === "golden"
    ? `translateY(${-progress * 0.4}px)`
    : mood === "spiritual"
    ? `translateX(${Math.sin((progress + i * 7) / 20) * 10}px)`
    : "none",

      width: mood === "rain" ? 2 : mood === "stars" ? 3 : 5,
      height: mood === "rain" ? 28 : mood === "stars" ? 3 : 5,

      borderRadius: mood === "rain" ? 999 : "50%",

      background:
        mood === "rain"
          ? "rgba(180,220,255,0.45)"
          : mood === "fire"
          ? "rgba(255,120,20,0.75)"
          : mood === "golden"
          ? "rgba(255,215,90,0.75)"
          : mood === "spiritual"
          ? "rgba(125,249,255,0.45)"
          : "rgba(255,255,255,0.55)",

      boxShadow:
        mood === "stars"
          ? "0 0 10px rgba(255,255,255,0.9)"
          : mood === "fire"
          ? "0 0 16px rgba(255,100,20,0.9)"
          : mood === "golden"
          ? "0 0 16px rgba(255,215,90,0.9)"
          : "none",

      opacity: mood === "rain" ? 0.55 : 0.8,
    }}
  />
))}

<div
  style={{
    textAlign: "center",
    width: "92%",
    zIndex: 10,

    opacity: 1,

    transform: "translateY(0px)",

    transition: "all 0.12s linear",
  }}
>
      <div
        style={{
fontSize:
  mode === "preview"
    ? `clamp(16px, ${32 - sceneText.length * 0.25}px, 34px)`
    : `clamp(28px, ${58 - sceneText.length * 0.35}px, 58px)`,

fontWeight: 900,
lineHeight: 1.1,
textTransform: "uppercase",
textShadow:
  "0 4px 12px rgba(0,0,0,0.9), 0 0 22px rgba(0,0,0,0.8)",

WebkitTextStroke:
  mode === "export"
    ? "2px rgba(0,0,0,0.45)"
    : "1px rgba(0,0,0,0.45)",

maxWidth: "100%",
paddingLeft: 20,
paddingRight: 20,
boxSizing: "border-box",

whiteSpace: "normal",
wordBreak: "keep-all",
overflowWrap: "normal",
        }}
      >

        {sceneText.split(" ").map((word, i) => {
  const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");

  const highlightWords = [
    "waheguru",
    "simran",
    "hukam",
    "guru",
    "chardi",
    "kala",
    "faith",
    "strength",
  ];

  const isHighlight = highlightWords.includes(cleanWord);
  const isLongWord = word.length > 12;

  return (
    <span
      key={i}
      style={{
        display: "inline",
        whiteSpace: "normal",

fontSize: isLongWord
  ? mode === "preview"
    ? Math.max(8, 24 - word.length * 0.6)
    : Math.max(14, 36 - word.length * 0.9)
  : "inherit",

        color: isHighlight ? "#facc15" : "white",
        textShadow: isHighlight
          ? "0 0 14px rgba(250,204,21,0.9)"
          : "inherit",
      }}
    >
      {word}{" "}
    </span>
  );
})}

      </div>

      <div
        style={{
          margin: "30px auto 0",
          width: 140,
          height: 8,
          borderRadius: 999,
          background: "#facc15",
        }}
      />

      <div
        style={{
          marginTop: 24,
          fontSize: 20,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          width: "100%",
        }}
      >
        {videoTag}
      </div>
    </div>

    <div
      style={{
        position: "absolute",
        bottom: mode === "export" ? 90 : 18,
        right: 18,
        fontSize: 22,
        padding: "8px 14px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.4)",
      }}
    >
      {Math.floor(elapsedTime / 60)}:
      {(elapsedTime % 60).toString().padStart(2, "0")}
      {" / "}
      {Math.floor(videoLength / 60)}:
      {(videoLength % 60).toString().padStart(2, "0")}
    </div>
  </div>
);
}