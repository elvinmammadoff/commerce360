"use client";

import * as React from "react";
import "@google/model-viewer";

export default function ModelViewerCore({ src }: { src: string }) {
  // model-viewer is a custom element — use createElement to avoid TS namespace issues
  return React.createElement("model-viewer", {
    src,
    alt: "Interactive 3D product model",
    "camera-controls": "",
    "auto-rotate": "",
    "shadow-intensity": "1",
    exposure: "1",
    "tone-mapping": "commerce",
    style: { width: "100%", height: "480px", background: "transparent" },
  });
}
