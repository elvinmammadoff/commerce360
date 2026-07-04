import type { ProductAssets } from "@/lib/types";

/**
 * Bundled orbit videos that stand in for freshly generated renders.
 * Swap these URLs for CDN/storage URLs in Phase 2 — nothing else changes.
 */
export const DEMO_ORBITS: ProductAssets[] = [
  {
    orbitVideoUrl: "/demo/chair.mp4",
    videoResolution: "4K",
    videoDurationSeconds: 10,
    videoSizeMb: 68,
    frameCount: 72,
    frameResolution: 2048,
    packageSizeMb: 218,
    marketplaceSetSizeMb: 24,
  },
  {
    orbitVideoUrl: "/demo/bed.mp4",
    videoResolution: "4K",
    videoDurationSeconds: 10,
    videoSizeMb: 74,
    frameCount: 72,
    frameResolution: 2048,
    packageSizeMb: 241,
    marketplaceSetSizeMb: 26,
  },
];
