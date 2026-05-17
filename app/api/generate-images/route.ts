import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const scenes = body.scenes;

  const imagePrompts = scenes.map((scene: string) => {
    return `Cinematic Sikh spiritual scene, ${scene}, dramatic lighting, realistic, 9:16`;
  });

  return NextResponse.json({
    prompts: imagePrompts,
  });
}