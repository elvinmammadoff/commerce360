"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { captureFrames, type CapturedFrame } from "@/lib/media/video-frames";
import { cn } from "@/lib/utils";
import type { ProductAssets } from "@/lib/types";

/**
 * The 72-frame set, extracted client-side from the orbit video and streamed
 * into the grid as each frame lands.
 */
export function FramesGallery({
  assets,
  productName,
}: {
  assets: ProductAssets;
  productName: string;
}) {
  const [frames, setFrames] = React.useState<CapturedFrame[]>([]);
  const [selected, setSelected] = React.useState<CapturedFrame | null>(null);

  React.useEffect(() => {
    setFrames([]);
    const cancel = captureFrames(
      assets.orbitVideoUrl,
      assets.frameCount,
      320,
      (frame) => setFrames((prev) => [...prev, frame]),
    );
    return cancel;
  }, [assets.orbitVideoUrl, assets.frameCount]);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {assets.frameCount} frames
          </span>{" "}
          · 5° intervals · {assets.frameResolution}×{assets.frameResolution} in
          the packaged ZIP
        </p>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {frames.length}/{assets.frameCount} loaded
        </p>
      </div>

      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: assets.frameCount }).map((_, i) => {
          const frame = frames[i];
          return (
            <li key={i} className="relative">
              {frame ? (
                <button
                  type="button"
                  onClick={() => setSelected(frame)}
                  className={cn(
                    "group block w-full overflow-hidden rounded-md border border-border outline-none",
                    "transition-all duration-150 hover:border-brand/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                  aria-label={`Open frame ${frame.index + 1}, ${frame.angle} degrees`}
                >
                  {/* Canvas-extracted data URL — not optimizable by next/image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frame.url}
                    alt=""
                    draggable={false}
                    className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                  />
                  <span className="absolute right-1 bottom-1 rounded bg-black/60 px-1 font-mono text-[9px] text-white/90 tabular-nums">
                    {frame.angle}°
                  </span>
                </button>
              ) : (
                <Skeleton className="aspect-square w-full rounded-md" />
              )}
            </li>
          );
        })}
      </ul>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Frame {(selected?.index ?? 0) + 1} of {assets.frameCount}
            </DialogTitle>
            <DialogDescription>
              {productName} · {selected?.angle}° ·{" "}
              {assets.frameResolution}×{assets.frameResolution} export
            </DialogDescription>
          </DialogHeader>
          {selected && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.url}
              alt={`${productName} at ${selected.angle} degrees`}
              className="w-full rounded-lg border border-border"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
