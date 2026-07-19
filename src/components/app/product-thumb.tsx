"use client";

import * as React from "react";
import {
  CircleAlert,
  Clock3,
  ImageIcon,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * Product thumbnail. Completed products display a frame from their orbit video
 * using a native <video> element — no canvas, no CORS restriction. Works for
 * both same-origin VPS-served videos and Higgsfield CDN URLs.
 */
export function ProductThumb({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const src = product.assets?.orbitVideoUrl;
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-[#f4f2ee]",
        !src && "bg-muted/30",
        className,
      )}
    >
      {src ? (
        <>
          {!visible && <div className="absolute inset-0 animate-pulse bg-muted/60" />}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={src}
            muted
            playsInline
            preload="metadata"
            className={cn(
              "size-full object-cover transition-opacity duration-200",
              visible ? "opacity-100" : "opacity-0",
            )}
            style={{ pointerEvents: "none" }}
            onLoadedMetadata={(e) => {
              e.currentTarget.currentTime = 0.5;
            }}
            onSeeked={() => setVisible(true)}
          />
        </>
      ) : product.status === "processing" ? (
        <Loader2 className="size-4 animate-spin text-brand" aria-hidden="true" />
      ) : product.status === "queued" ? (
        <Clock3 className="size-4 text-warning" aria-hidden="true" />
      ) : product.status === "failed" ? (
        <CircleAlert className="size-4 text-destructive" aria-hidden="true" />
      ) : (
        <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      )}
    </div>
  );
}
