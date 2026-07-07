"use client";

import * as React from "react";

import type { AdminJobRow } from "@/lib/types";

/**
 * Admin job rows are fixtures, but a frozen progress bar reads as broken —
 * tick running jobs forward slowly, capped before completion so the fixture
 * state stays consistent across the console.
 */
export function useLiveAdminJobs(initial: AdminJobRow[]) {
  const [jobs, setJobs] = React.useState(initial);

  React.useEffect(() => {
    const hasRunning = initial.some((j) => j.status === "running");
    if (!hasRunning) return;
    const interval = window.setInterval(() => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.status !== "running") return job;
          const progress = Math.min(97, job.progress + Math.random() * 1.4);
          return { ...job, progress };
        }),
      );
    }, 1800);
    return () => window.clearInterval(interval);
  }, [initial]);

  return jobs;
}
