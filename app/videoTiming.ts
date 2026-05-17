export function getSceneTiming({
  scenes,
  totalFrames,
  frame,
}: {
  scenes: string[];
  totalFrames: number;
  frame: number;
}) {
  const safeScenes = scenes.length > 0 ? scenes : [""];

const weightsPerScene = safeScenes.map((scene) =>
  Math.max(
    scene.trim().split(/\s+/).length * 6,
    scene.trim().length
  )
);

  const totalWords = weightsPerScene.reduce((a, b) => a + b, 0);

  const sceneDurations = weightsPerScene.map((words) =>
    Math.floor((words / totalWords) * totalFrames)
  );

  let accumulated = 0;
  let currentScene = 0;
  let sceneStartFrame = 0;
  let currentSceneDuration = sceneDurations[0];

  for (let i = 0; i < sceneDurations.length; i++) {
    const duration = sceneDurations[i];

    if (frame < accumulated + duration) {
      currentScene = i;
      sceneStartFrame = accumulated;
      currentSceneDuration = duration;
      break;
    }

    accumulated += duration;
  }

  const sceneFrame = frame - sceneStartFrame;

  const progress = Math.min(
    100,
    (sceneFrame / currentSceneDuration) * 100
  );

  return {
    currentScene,
    progress,
    sceneFrame,
    currentSceneDuration,
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