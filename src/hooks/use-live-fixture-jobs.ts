"use client";

import * as React from "react";

import { stageFromProgress, TYPICAL_PCT_PER_SECOND } from "@/lib/pipeline";
import type { GenerationJob } from "@/lib/types";

/**
 * Fixture jobs are static data, but a frozen progress bar reads as broken —
 * advance running ones at real production pace (~0.15%/s), capped before
 * completion so fixture state stays consistent across the app.
 */
export function useLiveFixtureJobs(initialJobs: GenerationJob[]) {
  const [jobs, setJobs] = React.useState(initialJobs);

  React.useEffect(() => {
    const hasRunning = initialJobs.some((j) => j.status === "running");
    if (!hasRunning) return;
    const interval = window.setInterval(() => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.status !== "running") return job;
          const progress = Math.min(93, job.progress + TYPICAL_PCT_PER_SECOND * 2);
          return {
            ...job,
            progress: Math.round(progress * 10) / 10,
            stage: stageFromProgress(progress),
          };
        }),
      );
    }, 2000);
    return () => window.clearInterval(interval);
  }, [initialJobs]);

  return jobs;
}
