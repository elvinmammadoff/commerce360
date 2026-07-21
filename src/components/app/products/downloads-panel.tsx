"use client";

import * as React from "react";
import {
  Box,
  Check,
  Download,
  FileArchive,
  FileVideo,
  Images,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatSizeMb } from "@/lib/format";
import type { Product, ProductAssets } from "@/lib/types";

interface DownloadItem {
  id: string;
  icon: LucideIcon;
  name: string;
  detail: string;
  sizeMb: number;
  /** Real file to hand the browser (the orbit video is genuinely local). */
  href?: string;
  filename?: string;
  complianceScores?: Record<string, number>;
}

function buildItems(product: Product, assets: ProductAssets): DownloadItem[] {
  const slug = product.shareSlug ?? product.id;
  const base = `/api/products/${product.id}/download`;
  return [
    {
      id: "package",
      icon: FileArchive,
      name: "Complete package",
      detail: `Orbit video, ${assets.frameCount} frames, marketplace set`,
      sizeMb: assets.packageSizeMb,
      href: `${base}?type=package`,
      filename: `${slug}-complete-package.zip`,
    },
    {
      id: "video",
      icon: FileVideo,
      name: `Orbit video · ${assets.videoResolution}`,
      detail: `Seamless ${assets.videoDurationSeconds}s loop · MP4 (H.265)`,
      sizeMb: assets.videoSizeMb,
      href: `${base}?type=video`,
      filename: `${slug}-orbit-${assets.videoResolution.toLowerCase()}.mp4`,
    },
    {
      id: "frames",
      icon: Images,
      name: `Frame set · ${assets.frameCount} stills`,
      detail: `${assets.frameResolution}×${assets.frameResolution} JPEG · ZIP`,
      sizeMb: Math.round(assets.packageSizeMb * 0.78),
      href: `${base}?type=frames`,
      filename: `${slug}-frames.zip`,
    },
    {
      id: "marketplace",
      icon: Store,
      name: "Marketplace set",
      detail: assets.marketplaceReady
        ? `6 platforms · white bg · compliance score ${assets.marketplaceScore ?? 0}/100`
        : "Amazon, Shopify, Etsy, Wayfair, Trendyol, Hepsiburada · generating…",
      sizeMb: assets.marketplaceSetSizeMb,
      href: assets.marketplaceReady ? `${base}?type=marketplace` : undefined,
      filename: `${slug}-marketplace-set.zip`,
      complianceScores: assets.marketplaceScores,
    },
    ...(assets.modelUrl ? [{
      id: "model",
      icon: Box,
      name: "3D model · GLB",
      detail: "Textured GLTF Binary — Blender, Three.js, AR Quick Look",
      sizeMb: assets.modelSizeMb ?? 0,
      href: `${base}?type=model`,
      filename: `${slug}-3d-model.glb`,
    }] : []),
  ];
}

type RowState = "idle" | "preparing" | "done";

function DownloadRow({ item }: { item: DownloadItem }) {
  const [state, setState] = React.useState<RowState>("idle");
  const [progress, setProgress] = React.useState(0);

  const start = () => {
    if (state === "preparing") return;
    setState("preparing");
    setProgress(0);

    const startedAt = performance.now();
    const durationMs = 1800 + Math.random() * 900;
    const tick = () => {
      const pct = Math.min(100, ((performance.now() - startedAt) / durationMs) * 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
        return;
      }
      setState("done");
      if (item.href) {
        const a = document.createElement("a");
        a.href = item.href;
        a.download = item.filename ?? "";
        document.body.append(a);
        a.click();
        a.remove();
        toast.success("Download started", { description: item.name });
      } else {
        toast.success("Download ready", {
          description: `${item.name} · link emailed to your workspace`,
        });
      }
    };
    requestAnimationFrame(tick);
  };

  const scores = item.complianceScores;

  return (
    <li className="rounded-xl border border-border bg-background/40">
      <div className="flex items-center gap-4 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
          <item.icon className="size-4.5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
          {state === "preparing" && (
            <Progress
              value={progress}
              className="mt-2 h-1"
              aria-label={`Preparing ${item.name}`}
            />
          )}
        </div>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {formatSizeMb(item.sizeMb)}
      </span>
      <Button
        type="button"
        variant={state === "done" ? "secondary" : "outline"}
        size="sm"
        className="w-28 justify-center"
        onClick={start}
        disabled={state === "preparing" || (!item.href && state === "idle")}
      >
        {state === "preparing" ? (
          `${Math.round(progress)}%`
        ) : state === "done" ? (
          <>
            <Check aria-hidden="true" /> Ready
          </>
        ) : !item.href ? (
          "Generating…"
        ) : (
          <>
            <Download aria-hidden="true" /> Download
          </>
        )}
      </Button>
      </div>
      {scores && Object.keys(scores).length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2">
          <span className="text-xs text-muted-foreground">Compliance:</span>
          {Object.entries(scores).map(([platform, score]) => (
            <span key={platform} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span
                className={`inline-block size-1.5 rounded-full ${score >= 90 ? "bg-success" : score >= 70 ? "bg-amber-500" : "bg-destructive"}`}
              />
              <span className="capitalize">{platform}</span>
              <span className="font-mono font-medium text-foreground">{score}<span className="text-muted-foreground font-normal">/100</span></span>
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

interface SizeMeta {
  video: number;
  frames: number;
  package: number;
  marketplace: number;
  model: number;
}

function Generate3dRow({ productId }: { productId: string }) {
  const [ordering, setOrdering] = React.useState(false);

  const order = () => {
    setOrdering(true);
    setTimeout(() => {
      setOrdering(false);
      toast.success("3D model queued", {
        description: "Hunyuan 3D 3.1 is generating your GLB · 7 credits deducted · ready in ~5 min.",
      });
    }, 1200);
  };

  return (
    <li className="rounded-xl border border-dashed border-border bg-background/20">
      <div className="flex items-center gap-4 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
          <Box className="size-4.5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">3D model · GLB</p>
          <p className="text-xs text-muted-foreground">Textured GLTF Binary — Blender, Three.js, AR Quick Look</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">~25 MB</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-28 justify-center"
          disabled={ordering}
          onClick={order}
        >
          {ordering ? (
            "Queuing…"
          ) : (
            <>
              <Sparkles aria-hidden="true" /> 7 credits
            </>
          )}
        </Button>
      </div>
    </li>
  );
}

export function DownloadsPanel({
  product,
  assets,
}: {
  product: Product;
  assets: ProductAssets;
}) {
  const [sizes, setSizes] = React.useState<SizeMeta | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/products/${product.id}/download?meta=1`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SizeMeta | null) => {
        if (!cancelled && data) setSizes(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const items = buildItems(product, assets).map((item) =>
    sizes ? { ...item, sizeMb: sizes[item.id as keyof SizeMeta] ?? item.sizeMb } : item,
  );

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <DownloadRow key={item.id} item={item} />
      ))}
      {!assets.modelUrl && <Generate3dRow productId={product.id} />}
    </ul>
  );
}
