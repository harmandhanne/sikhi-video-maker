export type BackgroundAsset = {
  type: "image" | "video";
  url: string;
  originalName?: string;
  mimeType?: string;
};