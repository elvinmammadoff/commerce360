"use client";

/**
 * Client-side frame capture from the bundled orbit videos.
 *
 * There is no backend in Phase 1, so product posters and the 72-frame
 * gallery are extracted in the browser: seek a hidden <video>, draw to
 * canvas, export JPEG data URLs. Same-origin assets keep the canvas clean.
 */

const posterCache = new Map<string, Promise<string>>();

function createHiddenVideo(src: string): HTMLVideoElement {
  const video = document.createElement("video");
  video.src = src;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  return video;
}

function waitForEvent(target: HTMLVideoElement, event: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onDone = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`Video failed while waiting for "${event}"`));
    };
    const cleanup = () => {
      target.removeEventListener(event, onDone);
      target.removeEventListener("error", onError);
    };
    target.addEventListener(event, onDone, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

function drawFrame(video: HTMLVideoElement, width: number): string {
  const scale = width / video.videoWidth;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

async function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  const seeked = waitForEvent(video, "seeked");
  video.currentTime = time;
  await seeked;
}

/** First-frame poster for thumbnails; cached per source URL. */
export function getVideoPoster(src: string, width = 480): Promise<string> {
  const cacheKey = `${src}@${width}`;
  const cached = posterCache.get(cacheKey);
  if (cached) return cached;

  const promise = (async () => {
    const video = createHiddenVideo(src);
    if (video.readyState < 2) await waitForEvent(video, "loadeddata");
    await seekTo(video, 0.05);
    const url = drawFrame(video, width);
    video.removeAttribute("src");
    video.load();
    return url;
  })();

  posterCache.set(cacheKey, promise);
  promise.catch(() => posterCache.delete(cacheKey));
  return promise;
}

export interface CapturedFrame {
  index: number;
  angle: number; // degrees
  url: string;
}

/**
 * Extract `count` evenly spaced frames across the orbit. Sequential seeks on
 * one hidden element; `onFrame` fires as each frame lands so galleries can
 * stream in. Returns a cancel function.
 */
export function captureFrames(
  src: string,
  count: number,
  width: number,
  onFrame: (frame: CapturedFrame) => void,
  onDone?: () => void,
): () => void {
  let cancelled = false;

  (async () => {
    const video = createHiddenVideo(src);
    if (video.readyState < 2) await waitForEvent(video, "loadeddata");
    const duration = video.duration;

    for (let i = 0; i < count; i++) {
      if (cancelled) break;
      // Keep a hair away from the exact end so the last seek resolves.
      const time = Math.min((i / count) * duration, duration - 0.05);
      await seekTo(video, time);
      if (cancelled) break;
      onFrame({
        index: i,
        angle: Math.round((i / count) * 360),
        url: drawFrame(video, width),
      });
    }

    video.removeAttribute("src");
    video.load();
    if (!cancelled) onDone?.();
  })().catch(() => {
    // Capture is progressive enhancement — galleries fall back to video.
  });

  return () => {
    cancelled = true;
  };
}
