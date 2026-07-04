"use client";

import * as React from "react";
import {
  CircleAlert,
  Clock3,
  ImageIcon,
  Loader2,
} from "lucide-react";

import { getVideoPoster } from "@/lib/media/video-frames";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * Product thumbnail: completed products show a canvas-captured first frame
 * of their orbit video; pipeline states show an honest placeholder instead
 * of fake imagery.
 */
export function ProductThumb({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const src = product.assets?.orbitVideoUrl;
  const [poster, setPoster] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!src) return;
    let active = true;
    getVideoPoster(src)
      .then((url) => {
        if (active) setPoster(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [src]);

  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-[#f4f2ee]",
        !src && "bg-muted/30",
        className,
      )}
    >
      {src ? (
        poster ? (
          // Data URLs from canvas capture — next/image can't optimize these.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={product.name}
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="size-full animate-pulse bg-muted/60" />
        )
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
