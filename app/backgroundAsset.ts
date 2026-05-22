export type BackgroundAsset = {
  type: "image" | "video";
  url: string;
  previewUrl?: string;
  originalName?: string;
  mimeType?: string;
};