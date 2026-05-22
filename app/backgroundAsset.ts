export type BackgroundAsset = {
  type: "image" | "video";
  url: string;
  previewUrl?: string;
  duration?: number;
  originalName?: string;
  mimeType?: string;
};