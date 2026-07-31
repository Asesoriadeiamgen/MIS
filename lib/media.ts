const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v", ".avi", ".mkv"];

export function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

export function firstImageUrl(urls: string[] | null | undefined): string | null {
  return urls?.find((u) => !isVideoUrl(u)) ?? null;
}
