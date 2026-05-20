export function getSceneTiming({
  scenes,
  totalFrames,
  frame,
  sceneDurations,
}: {
  scenes: string[];
  totalFrames: number;
  frame: number;
  sceneDurations?: number[];
}) {
  const safeScenes = scenes.length > 0 ? scenes : [""];

  const hasVoiceDurations =
    sceneDurations &&
    sceneDurations.length === safeScenes.length &&
    sceneDurations.some((duration) => duration > 0);

  let sceneFrameDurations: number[];

  if (hasVoiceDurations) {
    const totalSeconds = sceneDurations.reduce((a, b) => a + b, 0);

    sceneFrameDurations = sceneDurations.map((duration) =>
      Math.max(1, Math.round((duration / totalSeconds) * totalFrames))
    );
  } else {
    const weightsPerScene = safeScenes.map((scene) =>
      Math.max(
        scene.trim().split(/\s+/).length * 6,
        scene.trim().length
      )
    );

    const totalWords = weightsPerScene.reduce((a, b) => a + b, 0) || 1;

    sceneFrameDurations = weightsPerScene.map((words) =>
      Math.max(1, Math.floor((words / totalWords) * totalFrames))
    );
  }

  let accumulated = 0;

  for (let i = 0; i < sceneFrameDurations.length; i++) {
    const duration = sceneFrameDurations[i];
    const isLastScene = i === sceneFrameDurations.length - 1;

    if (frame < accumulated + duration || isLastScene) {
      const sceneFrame = Math.max(0, frame - accumulated);

      const progress = Math.min(
        100,
        (sceneFrame / duration) * 100
      );

      return {
        currentScene: i,
        progress,
        sceneFrame,
        currentSceneDuration: duration,
      };
    }

    accumulated += duration;
  }

  return {
    currentScene: 0,
    progress: 100,
    sceneFrame: 0,
    currentSceneDuration: totalFrames,
  };
}


export function getSceneDurations({
  scenes,
  videoLength,
}: {
  scenes: string[];
  videoLength: number;
}) {
  const safeScenes = scenes.length > 0 ? scenes : [""];

const weightsPerScene = safeScenes.map((scene) =>
  Math.max(
    scene.trim().split(/\s+/).length * 6,
    scene.trim().length
  )
);

  const totalWords = weightsPerScene.reduce((a, b) => a + b, 0);

  return weightsPerScene.map((words) =>
    Math.round((words / totalWords) * videoLength)
  );
}