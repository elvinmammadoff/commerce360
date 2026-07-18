"use client";

import * as React from "react";
import { toast } from "sonner";

import { DEMO_ORBITS } from "@/lib/demo-assets";
import { deriveJobState, fakeRenderSeconds } from "@/lib/simulation/engine";
import type { GenerationJob, Product, ProductCategory } from "@/lib/types";

const TICK_MS = 250;

function storageKey(userId: string) {
  return `c360.simulation.v2.${userId}`;
}

export interface StartGenerationInput {
  name: string;
  sku: string;
  category: ProductCategory;
  sourceImageName: string;
  background: string;
  resolution: "1080p" | "4K";
}

interface StoredState {
  products: Product[];
  jobs: GenerationJob[];
  /** Credits consumed by renders started in this demo session. */
  creditsUsed: number;
  /** Credits added by purchases made in this demo session. */
  creditsPurchased: number;
  /** Deterministic per-product demo asset assignment. */
  assetIndexByProduct: Record<string, number>;
}

interface SimulationContextValue {
  /** Simulated products/jobs with live-derived stage & progress. */
  products: Product[];
  jobs: GenerationJob[];
  /** Credits consumed by renders started in this demo session. */
  creditsUsed: number;
  /** Credits added by purchases made in this demo session. */
  creditsPurchased: number;
  creditsBalance: number;
  startGeneration: (input: StartGenerationInput) => string;
  purchaseCredits: (credits: number) => void;
}

const SimulationContext = React.createContext<SimulationContextValue | null>(null);

const EMPTY_STATE: StoredState = {
  products: [],
  jobs: [],
  creditsUsed: 0,
  creditsPurchased: 0,
  assetIndexByProduct: {},
};

function loadStored(userId: string): StoredState {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as StoredState;
    return {
      products: parsed.products ?? [],
      jobs: parsed.jobs ?? [],
      creditsUsed: parsed.creditsUsed ?? 0,
      creditsPurchased: parsed.creditsPurchased ?? 0,
      assetIndexByProduct: parsed.assetIndexByProduct ?? {},
    };
  } catch {
    return EMPTY_STATE;
  }
}

function persist(userId: string, state: StoredState) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    // Storage full or blocked — the demo simply won't persist across reloads.
  }
}

export function SimulationProvider({
  initialCredits,
  userId,
  children,
}: {
  initialCredits: number;
  /** Namespaces the localStorage state per account so switching Google accounts never shares sim data. */
  userId: string;
  children: React.ReactNode;
}) {
  const [stored, setStored] = React.useState<StoredState>(EMPTY_STATE);
  const [now, setNow] = React.useState(() => Date.now());

  // Hydrate after mount so SSR output stays deterministic.
  React.useEffect(() => {
    setStored(loadStored(userId));
  }, [userId]);

  const hasActiveJobs = stored.jobs.some(
    (job) => job.status === "queued" || job.status === "running",
  );

  React.useEffect(() => {
    if (!hasActiveJobs) return;
    const interval = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(interval);
  }, [hasActiveJobs]);

  // Finalize jobs whose simulated time has fully elapsed.
  React.useEffect(() => {
    const finished = stored.jobs.filter(
      (job) =>
        (job.status === "queued" || job.status === "running") &&
        deriveJobState(Date.parse(job.createdAt), now).finished,
    );
    if (finished.length === 0) return;

    setStored((prev) => {
      const next: StoredState = {
        ...prev,
        jobs: prev.jobs.map((job) => {
          if (!finished.some((f) => f.id === job.id)) return job;
          return {
            ...job,
            status: "completed" as const,
            stage: "packaging" as const,
            progress: 100,
            finishedAt: new Date().toISOString(),
            durationSeconds: fakeRenderSeconds(job.id),
          };
        }),
        products: prev.products.map((product) => {
          const job = finished.find((f) => f.productId === product.id);
          if (!job) return product;
          const assetIndex = prev.assetIndexByProduct[product.id] ?? 0;
          return {
            ...product,
            status: "completed" as const,
            completedAt: new Date().toISOString(),
            renderSeconds: fakeRenderSeconds(job.id),
            assets: DEMO_ORBITS[assetIndex % DEMO_ORBITS.length],
            shareSlug: product.id.replace(/^prd_/, ""),
          };
        }),
      };
      persist(userId, next);
      return next;
    });

    for (const job of finished) {
      toast.success(`${job.productName} is ready`, {
        description: "360° viewer, orbit video, and 72 frames are live.",
        action: {
          label: "View product",
          onClick: () => {
            window.location.href = `/products/${job.productId}`;
          },
        },
      });
    }
  }, [stored.jobs, now]);

  const startGeneration = React.useCallback(
    (input: StartGenerationInput): string => {
      const stamp = Date.now();
      const productId = `prd_sim_${stamp}`;
      const nowIso = new Date(stamp).toISOString();

      const product: Product = {
        id: productId,
        name: input.name,
        sku: input.sku,
        category: input.category,
        status: "processing",
        version: 1,
        createdAt: nowIso,
        completedAt: null,
        creditsUsed: 1,
        views: 0,
        downloads: 0,
        shareSlug: null,
        sourceImageName: input.sourceImageName,
        renderSeconds: null,
        assets: null,
      };

      const job: GenerationJob = {
        id: `job_sim_${stamp}`,
        productId,
        productName: input.name,
        version: 1,
        status: "running",
        stage: "queued",
        progress: 0,
        settings: `${input.background} · 72 frames · ${input.resolution}`,
        createdAt: nowIso,
        finishedAt: null,
        durationSeconds: null,
        creditsUsed: 1,
      };

      setStored((prev) => {
        const next: StoredState = {
          ...prev,
          products: [product, ...prev.products],
          jobs: [job, ...prev.jobs],
          creditsUsed: prev.creditsUsed + 1,
          assetIndexByProduct: {
            ...prev.assetIndexByProduct,
            // Match the demo asset to the product type so the finished
            // render looks like what was uploaded.
            [productId]: input.category === "beds" ? 1 : 0,
          },
        };
        persist(userId, next);
        return next;
      });

      return productId;
    },
    [userId],
  );

  const purchaseCredits = React.useCallback((credits: number) => {
    setStored((prev) => {
      // Purchases add credits to the wallet, raising the derived balance.
      const next: StoredState = {
        ...prev,
        creditsPurchased: prev.creditsPurchased + credits,
      };
      persist(userId, next);
      return next;
    });
  }, [userId]);

  // Expose live-derived stage/progress without persisting every tick.
  const value = React.useMemo<SimulationContextValue>(() => {
    const jobs = stored.jobs.map((job) => {
      if (job.status !== "queued" && job.status !== "running") return job;
      const derived = deriveJobState(Date.parse(job.createdAt), now);
      return {
        ...job,
        status: derived.stage === "queued" ? ("queued" as const) : ("running" as const),
        stage: derived.stage,
        progress: derived.progress,
      };
    });
    return {
      products: stored.products,
      jobs,
      creditsUsed: stored.creditsUsed,
      creditsPurchased: stored.creditsPurchased,
      creditsBalance: Math.max(
        0,
        initialCredits + stored.creditsPurchased - stored.creditsUsed,
      ),
      startGeneration,
      purchaseCredits,
    };
  }, [stored, now, initialCredits, startGeneration, purchaseCredits]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const ctx = React.useContext(SimulationContext);
  if (!ctx) {
    throw new Error("useSimulation must be used inside <SimulationProvider>");
  }
  return ctx;
}
