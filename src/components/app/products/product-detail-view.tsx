"use client";

import * as React from "react";
import Link from "next/link";
import {
  CircleAlert,
  Clock3,
  Download,
  ImageIcon,
  MapPin,
  PackageSearch,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { DownloadsPanel } from "@/components/app/products/downloads-panel";
import { FramesGallery } from "@/components/app/products/frames-gallery";
import { PipelineProgress } from "@/components/app/products/pipeline-progress";
import { ShareDialog } from "@/components/app/products/share-dialog";
import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import { EmptyState } from "@/components/shared/empty-state";
import { categoryLabel } from "@/lib/detect-category";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HotspotEditor } from "@/components/app/products/hotspot-editor";
import { useLiveFixtureJobs } from "@/hooks/use-live-fixture-jobs";
import { formatDate, formatDuration, formatNumber } from "@/lib/format";
import { getStage } from "@/lib/pipeline";
import { useSimulation } from "@/lib/simulation/provider";
import type { GenerationJob, Hotspot, Product } from "@/lib/types";

const CATEGORY_LABEL: Record<Product["category"], string> = {
  accessories: "Accessories",
  electronics: "Electronics",
  fashion: "Fashion",
  furniture: "Furniture",
  food_beverage: "Food & Beverage",
  general: "General",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function DetailsCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <DetailRow label="Status" value={<StatusBadge status={product.status} />} />
          {product.version > 0 && (
            <DetailRow label="Version" value={`v${product.version}`} />
          )}
          <DetailRow label="SKU" value={<span className="font-mono text-xs">{product.sku}</span>} />
          <DetailRow label="Category" value={CATEGORY_LABEL[product.category]} />
          <DetailRow label="Source file" value={<span className="font-mono text-xs">{product.sourceImageName}</span>} />
          <DetailRow label="Created" value={formatDate(product.createdAt)} />
          {product.completedAt && (
            <DetailRow label="Completed" value={formatDate(product.completedAt)} />
          )}
          {product.renderSeconds !== null && (
            <DetailRow label="Render time" value={formatDuration(product.renderSeconds)} />
          )}
          <DetailRow label="Credits used" value={product.creditsUsed} />
        </dl>
      </CardContent>
    </Card>
  );
}

function AssetsCard({ product }: { product: Product }) {
  if (!product.assets) return null;
  const assets = product.assets;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated assets</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <DetailRow
            label="Frames"
            value={`${assets.frameCount} · ${assets.frameResolution}×${assets.frameResolution}`}
          />
          <DetailRow
            label="Orbit video"
            value={`${assets.videoResolution} · ${assets.videoDurationSeconds}s loop`}
          />
          <DetailRow label="Package" value={`${assets.packageSizeMb} MB`} />
          <DetailRow label="Marketplace set" value="Amazon · Shopify · Etsy" />
        </dl>
      </CardContent>
    </Card>
  );
}

function EngagementCard({ product }: { product: Product }) {
  if (product.status !== "completed") return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement</CardTitle>
        <CardDescription>Share page &amp; embeds</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <DetailRow label="Viewer loads" value={formatNumber(product.views)} />
          <DetailRow label="Downloads" value={formatNumber(product.downloads)} />
        </dl>
      </CardContent>
    </Card>
  );
}

export function ProductDetailView({
  initialProduct,
  initialJobs,
  productId,
}: {
  initialProduct?: Product;
  initialJobs: GenerationJob[];
  productId: string;
}) {
  const sim = useSimulation();
  const router = useRouter();
  const liveFixtureJobs = useLiveFixtureJobs(initialJobs);

  // Poll real job status for products coming from the actual pipeline (not sim).
  const isRealProduct = !productId.startsWith("prd_sim_");
  const [polledJob, setPolledJob] = React.useState<GenerationJob | null>(() =>
    initialJobs.find((j) => j.productId === productId) ?? null,
  );

  React.useEffect(() => {
    if (!isRealProduct) return;
    const job = initialJobs.find((j) => j.productId === productId);
    const needsPoll = job?.status === "running" || job?.status === "queued" ||
      initialProduct?.status === "processing" || initialProduct?.status === "queued";
    if (!needsPoll) return;

    let active = true;

    async function poll() {
      if (!active) return;
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const jobs = (await res.json()) as Array<Record<string, unknown>>;
          const found = jobs.find((j) => j.product_id === productId);
          if (found) {
            let mapped: GenerationJob = {
              id: found.id as string,
              productId: found.product_id as string,
              productName: (found.product_name as string) ?? "",
              version: (found.version as number) ?? 1,
              status: found.status as GenerationJob["status"],
              stage: found.stage as GenerationJob["stage"],
              progress: (found.progress as number) ?? 0,
              settings: (found.settings as string) ?? "",
              createdAt: found.created_at as string,
              finishedAt: (found.finished_at as string | null) ?? null,
              durationSeconds: (found.duration_seconds as number | null) ?? null,
              creditsUsed: (found.credits_used as number) ?? 1,
              error: (found.error as string | undefined) ?? undefined,
            };
            // If job has an error but backend didn't set status to "failed" yet, treat it as failed.
            if (mapped.error && mapped.status === "queued") {
              mapped = { ...mapped, status: "failed" };
            }
            setPolledJob(mapped);
            if (mapped.status === "completed" || mapped.status === "failed") {
              router.refresh();
              return;
            }
          }
        }
      } catch {
        // Non-fatal — keep polling
      }
      if (active) window.setTimeout(poll, 3000);
    }

    void poll();
    return () => { active = false; };
  }, [isRealProduct, productId, initialJobs, initialProduct?.status, router]);

  const simProduct = sim.products.find((p) => p.id === productId);
  const product = simProduct ?? initialProduct;

  // Hotspots (premium) — seeded from the product, editable, persisted locally.
  const hotspotsKey = `c360.hotspots.${productId}`;
  const [hotspots, setHotspots] = React.useState<Hotspot[]>(
    product?.hotspots ?? [],
  );
  const angleRef = React.useRef(0);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(hotspotsKey);
      if (raw) setHotspots(JSON.parse(raw));
    } catch {
      // Ignore malformed/blocked storage — fall back to seeded hotspots.
    }
  }, [hotspotsKey]);

  const updateHotspots = React.useCallback(
    (next: Hotspot[]) => {
      setHotspots(next);
      try {
        window.localStorage.setItem(hotspotsKey, JSON.stringify(next));
      } catch {
        // Non-fatal — editing still works for the session.
      }
    },
    [hotspotsKey],
  );

  const activeJob =
    sim.jobs.find(
      (j) =>
        j.productId === productId &&
        (j.status === "running" || j.status === "queued"),
    ) ??
    (polledJob && !polledJob.error && (polledJob.status === "running" || polledJob.status === "queued")
      ? polledJob
      : null) ??
    liveFixtureJobs.find(
      (j) => j.status === "running" || j.status === "queued",
    );

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <EmptyState
          icon={PackageSearch}
          title="Product not found"
          description="It may have been removed, or the link is wrong."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Back to products</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isPipelineActive =
    product.status === "processing" || product.status === "queued";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {product.name}
            </h1>
            {product.isDemo && (
              <span className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Demo
              </span>
            )}
            <StatusBadge status={product.status} />
            {product.version > 0 && (
              <Badge variant="secondary" className="font-mono text-[11px]">
                v{product.version}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm text-muted-foreground">
              {product.sku}
            </p>
            <span
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
              title="Category detected automatically from the product photo"
            >
              <Sparkles className="size-3" aria-hidden="true" />
              Detected: {categoryLabel(product.category)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {product.status === "completed" && product.assets && (
            <>
              <ShareDialog product={product} />
              <Button asChild variant="outline" size="sm">
                <Link href={`/products/${product.id}/viewer`}>
                  <Sparkles aria-hidden="true" /> Fullscreen viewer
                </Link>
              </Button>
              <Button asChild size="sm">
                <a
                  href={product.assets.orbitVideoUrl}
                  download={`${product.shareSlug ?? product.id}-orbit.mp4`}
                >
                  <Download aria-hidden="true" /> Orbit video
                </a>
              </Button>
            </>
          )}
          {product.status === "failed" && (
            <Button asChild size="sm">
              <Link href={`/upload?retry=${product.id}`}>
                <RefreshCcw aria-hidden="true" /> Retry render
              </Link>
            </Button>
          )}
          {product.status === "draft" && (
            <Button asChild size="sm">
              <Link href={`/upload?draft=${product.id}`}>
                <Sparkles aria-hidden="true" /> Start render
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {product.status === "completed" && product.assets ? (
            <Tabs defaultValue="viewer">
              <TabsList>
                <TabsTrigger value="viewer">360° viewer</TabsTrigger>
                <TabsTrigger value="video">Orbit video</TabsTrigger>
                <TabsTrigger value="frames">Frames</TabsTrigger>
                <TabsTrigger value="downloads">Downloads</TabsTrigger>
                <TabsTrigger value="hotspots" className="gap-1.5">
                  <MapPin aria-hidden="true" className="size-3.5" />
                  Hotspots
                </TabsTrigger>
              </TabsList>
              <TabsContent value="viewer" className="mt-4">
                <TurntableViewer
                  src={product.assets.orbitVideoUrl}
                  frameCount={product.assets.frameCount}
                  productName={product.name}
                  hotspots={hotspots}
                  onAngleChange={(a) => {
                    angleRef.current = a;
                  }}
                  className="aspect-[4/3] w-full"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Drag to rotate · arrow keys step 5° · Space auto-rotates · F
                  for fullscreen
                </p>
              </TabsContent>
              <TabsContent value="video" className="mt-4">
                <video
                  src={product.assets.orbitVideoUrl}
                  controls
                  loop
                  muted
                  playsInline
                  className="aspect-[4/3] w-full rounded-2xl border border-border bg-[#0d0d0d] object-contain"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Seamless loop · {product.assets.videoResolution} · ideal for
                  PDPs, ads, and social
                </p>
              </TabsContent>
              <TabsContent value="frames" className="mt-4">
                <FramesGallery assets={product.assets} productName={product.name} />
              </TabsContent>
              <TabsContent value="downloads" className="mt-4">
                <DownloadsPanel product={product} assets={product.assets} />
              </TabsContent>
              <TabsContent value="hotspots" className="mt-4 space-y-4">
                <div className="flex items-start gap-2 rounded-lg border border-brand/30 bg-brand/5 p-3">
                  <Sparkles
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-brand"
                  />
                  <div className="space-y-0.5">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      Interactive hotspots
                      <span className="rounded-sm bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-brand uppercase">
                        Premium
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pin clickable callouts — materials, specs, add-to-cart —
                      that appear as the product spins. Live-previewed in the
                      360° viewer tab.
                    </p>
                  </div>
                </div>
                <HotspotEditor
                  hotspots={hotspots}
                  onChange={updateHotspots}
                  getCurrentAngle={() => angleRef.current}
                />
              </TabsContent>
            </Tabs>
          ) : isPipelineActive ? (
            <Card>
              <CardHeader>
                <CardTitle>Render in progress</CardTitle>
                <CardDescription>
                  {activeJob ? (
                    <>
                      {getStage(activeJob.stage).label} · queued{" "}
                      <RelativeTime iso={activeJob.createdAt} /> · typically
                      done in ~11 min
                    </>
                  ) : (
                    "Waiting for pipeline telemetry…"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeJob && <PipelineProgress job={activeJob} />}
              </CardContent>
            </Card>
          ) : product.status === "failed" ? (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Render failed — credit refunded</AlertTitle>
              <AlertDescription>
                {product.failureReason ??
                  "Something went wrong during rendering. Retry or contact support."}
              </AlertDescription>
            </Alert>
          ) : (
            <EmptyState
              icon={ImageIcon}
              title="Source uploaded — not rendered yet"
              description={`${product.sourceImageName} is ready. Start a render to generate the 360° viewer, orbit video, and frame set.`}
              action={
                <Button asChild size="sm">
                  <Link href={`/upload?draft=${product.id}`}>
                    <Sparkles aria-hidden="true" /> Start render · 1 credit
                  </Link>
                </Button>
              }
              className="min-h-72"
            />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <DetailsCard product={product} />
          <AssetsCard product={product} />
          <EngagementCard product={product} />
          {isPipelineActive && (
            <Card className="border-brand/20 bg-brand/5">
              <CardContent className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  We&apos;ll notify you the moment this render finishes. You can
                  safely leave this page.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
