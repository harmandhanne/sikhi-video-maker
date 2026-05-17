export type RenderJob = {
  id: string;
  progress: number;
  status: "rendering" | "done" | "error";
  downloadUrl?: string;
  error?: string;
};

export const renderJobs = new Map<string, RenderJob>();