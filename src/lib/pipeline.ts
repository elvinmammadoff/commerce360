import type { StageDef, StageId } from "@/lib/types";

/**
 * The generation pipeline, in order. Mirrors the production architecture
 * (docs/architecture.md): normalization → orbit render → 4K enhancement →
 * frame extraction → packaging. `typicalSeconds` is what the UI reports as
 * production timing; `simSeconds` is the compressed demo timing used by the
 * client-side simulator.
 */
export const PIPELINE_STAGES: StageDef[] = [
  {
    id: "queued",
    label: "Queued",
    description: "Waiting for an available render node",
    engine: "Scheduler",
    typicalSeconds: 40,
    simSeconds: 2.5,
  },
  {
    id: "normalizing",
    label: "Normalizing source",
    description: "Background removal and studio color fill",
    engine: "BG Remover",
    typicalSeconds: 95,
    simSeconds: 4,
  },
  {
    id: "rendering",
    label: "Rendering orbit",
    description: "Generating the 360° camera path around the product",
    engine: "Higgsfield DoP",
    typicalSeconds: 540,
    simSeconds: 7,
  },
  {
    id: "upscaling",
    label: "Upscaling to 4K",
    description: "Detail-preserving video enhancement pass",
    engine: "Higgsfield",
    typicalSeconds: 240,
    simSeconds: 5,
  },
  {
    id: "extracting",
    label: "Extracting frames",
    description: "72 stills at 5° intervals, color-matched to source",
    engine: "Frame engine",
    typicalSeconds: 60,
    simSeconds: 3.5,
  },
  {
    id: "modeling",
    label: "Generating 3D model",
    description: "Reconstructing textured 3D geometry from the product image",
    engine: "Hunyuan 3D 3.1",
    typicalSeconds: 150,
    simSeconds: 3,
  },
  {
    id: "packaging",
    label: "Packaging assets",
    description: "Marketplace crops, ZIP assembly, CDN upload",
    engine: "Asset packer",
    typicalSeconds: 40,
    simSeconds: 2,
  },
];

export const TOTAL_SIM_SECONDS = PIPELINE_STAGES.reduce(
  (sum, stage) => sum + stage.simSeconds,
  0,
);

export function getStage(id: StageId): StageDef {
  const stage = PIPELINE_STAGES.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown pipeline stage: ${id}`);
  return stage;
}

export function stageIndex(id: StageId): number {
  return PIPELINE_STAGES.findIndex((s) => s.id === id);
}

/** Overall 0–100 progress given a stage and progress within that stage. */
export function overallProgress(stage: StageId, stagePct: number): number {
  const idx = stageIndex(stage);
  const done = PIPELINE_STAGES.slice(0, idx).reduce(
    (sum, s) => sum + s.simSeconds,
    0,
  );
  const current = PIPELINE_STAGES[idx].simSeconds * (stagePct / 100);
  return Math.min(100, Math.round(((done + current) / TOTAL_SIM_SECONDS) * 100));
}

const TOTAL_TYPICAL_SECONDS = PIPELINE_STAGES.reduce(
  (sum, stage) => sum + stage.typicalSeconds,
  0,
);

/**
 * Which stage a production render is in at a given overall progress —
 * used to keep long-running fixture jobs advancing believably on screen.
 */
export function stageFromProgress(progressPct: number): StageId {
  const elapsed = (progressPct / 100) * TOTAL_TYPICAL_SECONDS;
  let cursor = 0;
  for (const stage of PIPELINE_STAGES) {
    cursor += stage.typicalSeconds;
    if (elapsed < cursor) return stage.id;
  }
  return "packaging";
}

/** Percent points a production render advances per second. */
export const TYPICAL_PCT_PER_SECOND = 100 / TOTAL_TYPICAL_SECONDS;
