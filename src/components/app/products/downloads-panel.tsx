"use client";

import * as React from "react";
import {
  Check,
  Download,
  FileArchive,
  FileVideo,
  Images,
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
}

function buildItems(product: Product, assets: ProductAssets): DownloadItem[] {
  const slug = product.shareSlug ?? product.id;
  return [
    {
      id: "package",
      icon: FileArchive,
      name: "Complete package",
      detail: `Orbit video, ${assets.frameCount} frames, marketplace set`,
      sizeMb: assets.packageSizeMb,
    },
    {
      id: "video",
      icon: FileVideo,
      name: `Orbit video · ${assets.videoResolution}`,
      detail: `Seamless ${assets.videoDurationSeconds}s loop · MP4 (H.265)`,
      sizeMb: assets.videoSizeMb,
      href: assets.orbitVideoUrl,
      filename: `${slug}-orbit-${assets.videoResolution.toLowerCase()}.mp4`,
    },
    {
      id: "frames",
      icon: Images,
      name: `Frame set · ${assets.frameCount} stills`,
      detail: `${assets.frameResolution}×${assets.frameResolution} JPEG · ZIP`,
      sizeMb: Math.round(assets.packageSizeMb * 0.78),
    },
    {
      id: "marketplace",
      icon: Store,
      name: "Marketplace set",
      detail: "Amazon, Shopify, Etsy & Wayfair specs",
      sizeMb: assets.marketplaceSetSizeMb,
    },
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

  return (
    <li className="flex items-center gap-4 rounded-xl border border-border bg-background/40 p-4">
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
        disabled={state === "preparing"}
      >
        {state === "preparing" ? (
          `${Math.round(progress)}%`
        ) : state === "done" ? (
          <>
            <Check aria-hidden="true" /> Ready
          </>
        ) : (
          <>
            <Download aria-hidden="true" /> Download
          </>
        )}
      </Button>
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
  const items = buildItems(product, assets);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <DownloadRow key={item.id} item={item} />
      ))}
    </ul>
  );
}
