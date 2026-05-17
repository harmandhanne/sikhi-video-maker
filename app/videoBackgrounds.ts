export function getSceneMood(scene: string) {
  const text = scene.toLowerCase();

  if (
    text.includes("pain") ||
    text.includes("hard") ||
    text.includes("struggle") ||
    text.includes("cry")
  ) {
    return "rain";
  }

  if (
    text.includes("waheguru") ||
    text.includes("simran") ||
    text.includes("peace") ||
    text.includes("calm")
  ) {
    return "spiritual";
  }

  if (
    text.includes("strength") ||
    text.includes("discipline") ||
    text.includes("power") ||
    text.includes("warrior")
  ) {
    return "fire";
  }

  if (
    text.includes("night") ||
    text.includes("stars") ||
    text.includes("dream")
  ) {
    return "stars";
  }

  if (
    text.includes("hukam") ||
    text.includes("guru") ||
    text.includes("sikhi")
  ) {
    return "golden";
  }

  return "default";
}