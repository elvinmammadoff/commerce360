"use client";

import { Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";

import { PIPELINE_STAGES, stageIndex } from "@/lib/pipeline";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GenerationJob } from "@/lib/types";

/**
 * Vertical stage tracker shown while a render is queued/running —
 * the moment where the product's pipeline story gets told.
 */
export function PipelineProgress({ job }: { job: GenerationJob }) {
  const currentIdx = stageIndex(job.stage);

  return (
    <ol className="space-y-0">
      {PIPELINE_STAGES.map((stage, idx) => {
        const state =
          job.status === "completed" || idx < currentIdx
            ? "done"
            : idx === currentIdx
              ? "active"
              : "pending";
        const isLast = idx === PIPELINE_STAGES.length - 1;

        return (
          <li key={stage.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-7 left-[13px] h-[calc(100%-1.75rem)] w-px",
                  state === "done" ? "bg-brand/50" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                state === "done" && "border-brand/50 bg-brand/15 text-brand",
                state === "active" && "border-brand bg-brand/10 text-brand",
                state === "pending" &&
                  "border-border bg-card text-muted-foreground/50",
              )}
            >
              {state === "done" ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : state === "active" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={cn(
                    "text-sm font-medium",
                    state === "pending" ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {stage.label}
                </p>
                <p className="shrink-0 font-mono text-[11px] text-muted-foreground/70 tabular-nums">
                  {stage.engine} · ~{formatDuration(stage.typicalSeconds)}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stage.description}
              </p>
              {state === "active" && (
                <motion.div
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
                >
                  <motion.div
                    key={stage.id}
                    className="h-full rounded-full bg-brand"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.max(8, Math.min(92, job.progress ?? 8))}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
