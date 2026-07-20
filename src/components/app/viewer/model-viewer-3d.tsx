"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const ModelViewerCore = dynamic(() => import("./model-viewer-core"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] items-center justify-center rounded-xl border border-border bg-muted/30">
      <p className="text-sm text-muted-foreground">Loading 3D model…</p>
    </div>
  ),
});

export function Model3DViewer({ src }: { src: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/10">
      <ModelViewerCore src={src} />
    </div>
  );
}
