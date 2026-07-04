import { PIPELINE_STAGES, TOTAL_SIM_SECONDS } from "@/lib/pipeline";
import type { StageId } from "@/lib/types";

export interface DerivedJobState {
  finished: boolean;
  stage: StageId;
  /** Progress within the current stage, 0–100. */
  stagePct: number;
  /** Overall progress, 0–100. */
  progress: number;
}

/**
 * The simulator is time-derived, not tick-incremented: everything is a pure
 * function of `startedAt`, so progress survives reloads and never drifts.
 */
export function deriveJobState(startedAtMs: number, nowMs: number): DerivedJobState {
  const elapsed = Math.max(0, (nowMs - startedAtMs) / 1000);

  if (elapsed >= TOTAL_SIM_SECONDS) {
    return { finished: true, stage: "packaging", stagePct: 100, progress: 100 };
  }

  let cursor = 0;
  for (const stage of PIPELINE_STAGES) {
    if (elapsed < cursor + stage.simSeconds) {
      const stagePct = ((elapsed - cursor) / stage.simSeconds) * 100;
      return {
        finished: false,
        stage: stage.id,
        stagePct: Math.round(stagePct),
        progress: Math.round((elapsed / TOTAL_SIM_SECONDS) * 100),
      };
    }
    cursor += stage.simSeconds;
  }

  return { finished: true, stage: "packaging", stagePct: 100, progress: 100 };
}

/** Realistic production render time to report for a finished demo job. */
export function fakeRenderSeconds(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return 630 + (Math.abs(hash) % 75); // 10m 30s – 11m 45s
}
