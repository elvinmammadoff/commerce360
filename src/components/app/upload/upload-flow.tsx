"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleAlert, ImageUp, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { PipelineProgress } from "@/components/app/products/pipeline-progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guessCategory } from "@/lib/detect-category";
import { getVideoPoster } from "@/lib/media/video-frames";
import { useSimulation } from "@/lib/simulation/provider";
import { cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/lib/types";

const BACKGROUNDS: { value: string; label: string; swatch: string }[] = [
  { value: "Studio white", label: "White", swatch: "linear-gradient(145deg,#ffffff,#eae7e0)" },
  { value: "Studio warm", label: "Warm", swatch: "linear-gradient(145deg,#f8f0e2,#e6d5bd)" },
  { value: "Soft gradient", label: "Gradient", swatch: "linear-gradient(145deg,#eef1f6,#ccd4df)" },
  { value: "Marble", label: "Marble", swatch: "linear-gradient(120deg,#f4f4f2 0%,#e2e2dd 40%,#f0efec 55%,#d7d7d1 100%)" },
  { value: "Charcoal", label: "Charcoal", swatch: "linear-gradient(145deg,#3b3b3e,#161617)" },
];

const OUTPUTS: { value: "1080p" | "4K"; title: string; hint: string }[] = [
  { value: "1080p", title: "Orbit video", hint: "Great for social sharing" },
  { value: "4K", title: "Video + 72 stills", hint: "Marketplace & lookbooks" },
];

// Re-render scenarios for the two catalog products that ship with the demo.
const SAMPLES = [
  {
    id: "chair",
    label: "Lounge chair",
    video: "/demo/chair.mp4",
    name: "Vireo Lounge Chair — Oxblood Velvet",
    sku: "VRO-114-OXB",
    category: "furniture" as ProductCategory,
    fileName: "vireo-oxblood-hero.jpg",
    demoAssetIndex: 0,
  },
  {
    id: "bed",
    label: "Upholstered bed",
    video: "/demo/bed.mp4",
    name: "Solvei Upholstered Bed — Dove Grey",
    sku: "SLV-208-DGR",
    category: "furniture" as ProductCategory,
    fileName: "solvei-dove-front.jpg",
    demoAssetIndex: 1,
  },
];

interface SourceImage {
  previewUrl: string;
  fileName: string;
  sizeLabel: string;
  isObjectUrl: boolean;
}

function Dropzone({
  source,
  onSelect,
  onClear,
}: {
  source: SourceImage | null;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Source must be an image", {
        description: "JPEG, PNG, or WebP — at least 1024px on the short edge.",
      });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Image is larger than 25 MB");
      return;
    }
    onSelect(file);
  };

  if (source) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border">
        {/* Local object URL / captured poster — plain img is correct here */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={source.previewUrl}
          alt="Source preview"
          className="aspect-[4/3] w-full bg-[#f4f2ee] object-contain"
        />
        <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-foreground">
              {source.fileName}
            </p>
            <p className="text-xs text-muted-foreground">{source.sizeLabel}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            aria-label="Remove source image"
          >
            <X />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed transition-colors duration-200 outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        dragging
          ? "border-brand bg-brand/5"
          : "border-border bg-card/50 hover:border-muted-foreground/40",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Upload source image"
      />
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full border transition-colors",
          dragging ? "border-brand/50 bg-brand/10" : "border-border bg-card",
        )}
      >
        <ImageUp
          className={cn("size-5", dragging ? "text-brand" : "text-muted-foreground")}
          aria-hidden="true"
        />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">
          Drop your product photo
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse · JPEG, PNG, WebP · min 1024px
        </p>
      </div>
    </button>
  );
}

export function UploadFlow({ prefill }: { prefill?: Product }) {
  const router = useRouter();
  const sim = useSimulation();

  const [source, setSource] = React.useState<SourceImage | null>(null);
  // Actual File object — present only for real uploads, null for demo samples.
  const [sourceFile, setSourceFile] = React.useState<File | null>(null);
  const [name, setName] = React.useState(prefill?.name ?? "");
  const [sku, setSku] = React.useState(prefill?.sku ?? "");
  const [background, setBackground] = React.useState<string>(BACKGROUNDS[0].value);
  const [resolution, setResolution] = React.useState<"1080p" | "4K">("4K");
  const [activeProductId, setActiveProductId] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [demoAssetIndex, setDemoAssetIndex] = React.useState<number>(0);

  const isRetry = prefill?.status === "failed";

  // Prefilled drafts/retries reuse the already-uploaded source file.
  React.useEffect(() => {
    if (prefill && !source) {
      setSource({
        previewUrl: "",
        fileName: prefill.sourceImageName,
        sizeLabel: "Already uploaded to your workspace",
        isObjectUrl: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  React.useEffect(() => {
    return () => {
      if (source?.isObjectUrl) URL.revokeObjectURL(source.previewUrl);
    };
  }, [source]);

  const activeJob = sim.jobs.find((j) => j.productId === activeProductId);
  const activeProduct = sim.products.find((p) => p.id === activeProductId);

  // Hand off to the product page once the render completes.
  React.useEffect(() => {
    if (activeProduct?.status === "completed") {
      const t = window.setTimeout(
        () => router.push(`/products/${activeProduct.id}`),
        900,
      );
      return () => window.clearTimeout(t);
    }
  }, [activeProduct?.status, activeProduct?.id, router]);

  const selectFile = (file: File) => {
    if (source?.isObjectUrl) URL.revokeObjectURL(source.previewUrl);
    setSourceFile(file);
    setSource({
      previewUrl: URL.createObjectURL(file),
      fileName: file.name,
      sizeLabel: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      isObjectUrl: true,
    });
    if (!name) {
      const base = file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
      setName(base.replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  };

  const applySample = async (sample: (typeof SAMPLES)[number]) => {
    try {
      const poster = await getVideoPoster(sample.video, 720);
      setSourceFile(null); // samples use simulation, not real upload
      setSource({
        previewUrl: poster,
        fileName: sample.fileName,
        sizeLabel: "Sample photo · 2.4 MB",
        isObjectUrl: false,
      });
      setName(sample.name);
      setSku(sample.sku);
      setDemoAssetIndex(sample.demoAssetIndex);
    } catch {
      toast.error("Couldn't load the sample photo");
    }
  };

  const canGenerate =
    source !== null && name.trim().length > 1 && sim.creditsBalance > 0 && !generating;

  const activeSimJob = sim.jobs.find(
    (j) => j.status === "queued" || j.status === "running",
  );

  const generate = async () => {
    if (!canGenerate || !source) return;

    const category: ProductCategory =
      prefill?.category ?? guessCategory(name, source.fileName);

    // Real file upload → full Higgsfield pipeline via real API.
    if (sourceFile) {
      setGenerating(true);
      try {
        const fd = new FormData();
        fd.append("file", sourceFile);
        fd.append("name", name.trim());
        fd.append("sku", sku.trim() || "SKU-TBD");
        fd.append("background", background);
        fd.append("resolution", resolution);
        fd.append("category", category);

        const res = await fetch("/api/products/start", { method: "POST", body: fd });
        const data = await res.json() as { productId?: string; error?: string };

        if (!res.ok) {
          if (res.status === 402) {
            toast.error("Out of credits", { description: "Buy more credits to keep rendering." });
          } else {
            toast.error("Failed to start render", { description: data.error ?? "Unknown error" });
          }
          return;
        }

        toast.info("Render started", {
          description: `${name.trim()} entered the pipeline · 1 credit used.`,
        });
        router.push(`/products/${data.productId}`);
      } catch {
        toast.error("Network error — please try again");
      } finally {
        setGenerating(false);
      }
      return;
    }

    // Retry a failed render — reuse the existing product, create a new job.
    if (isRetry && prefill?.id) {
      setGenerating(true);
      try {
        const fd = new FormData();
        if (sourceFile) fd.append("file", sourceFile);
        fd.append("background", background);
        fd.append("resolution", resolution);
        fd.append("category", category);

        const res = await fetch(`/api/products/${prefill.id}/retry`, { method: "POST", body: fd });
        const data = await res.json() as { productId?: string; error?: string };

        if (!res.ok) {
          if (res.status === 402) {
            toast.error("Out of credits", { description: "Buy more credits to keep rendering." });
          } else if (res.status === 400 && data.error?.includes("re-upload")) {
            toast.error("Re-upload required", {
              description: "Original image not found. Select your photo again and retry.",
            });
            // Clear the fake pre-filled source so dropzone shows
            setSource(null);
            setSourceFile(null);
          } else {
            toast.error("Failed to retry render", { description: data.error ?? "Unknown error" });
          }
          return;
        }

        toast.info("Render started", {
          description: `${name.trim()} re-entered the pipeline.`,
        });
        router.push(`/products/${data.productId}`);
      } catch {
        toast.error("Network error — please try again");
      } finally {
        setGenerating(false);
      }
      return;
    }

    // Demo sample → simulation (shows fake pipeline, uses demo assets).
    const productId = sim.startGeneration({
      name: name.trim(),
      sku: sku.trim() || "SKU-TBD",
      category,
      sourceImageName: source.fileName,
      background,
      resolution,
      demoAssetIndex,
    });
    setActiveProductId(productId);
    toast.info("Render started", {
      description: `${name.trim()} entered the pipeline · 1 credit used.`,
    });
  };

  // ------- Progress state -------------------------------------------------

  if (activeProductId && activeJob) {
    const done = activeProduct?.status === "completed";
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle>{done ? "Render complete" : "Rendering your product"}</CardTitle>
            <CardDescription>
              {done ? (
                <>Taking you to {activeJob.productName}…</>
              ) : (
                <>
                  {activeJob.productName} · {activeJob.settings} — in production
                  this takes ~11 minutes; the demo pipeline is compressed.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PipelineProgress job={activeJob} />
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                You can leave — we&apos;ll notify you when it&apos;s ready.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/products/${activeProductId}`}>
                  Product page <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ------- Form state -------------------------------------------------------

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        {isRetry && (
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Retrying a failed render</AlertTitle>
            <AlertDescription>
              {prefill?.failureReason} The refunded credit covers this retry.
            </AlertDescription>
          </Alert>
        )}
        <Dropzone
          source={source}
          onSelect={selectFile}
          onClear={() => {
            if (source?.isObjectUrl) URL.revokeObjectURL(source.previewUrl);
            setSource(null);
            setSourceFile(null);
          }}
        />
        {!source && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              No photo handy? Try a sample:
            </span>
            {SAMPLES.map((sample) => (
              <Button
                key={sample.id}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => applySample(sample)}
              >
                {sample.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <Card className="h-fit lg:col-span-2">
        <CardHeader>
          <CardTitle>Render settings</CardTitle>
          <CardDescription>
            One credit produces every output format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aria Bouclé Armchair — Ivory"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="ARA-042-IVY"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Must match the{" "}
              <code className="font-mono">data-sku</code> in your widget script
              tag.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Background</Label>
            <div
              className="grid grid-cols-5 gap-2"
              role="radiogroup"
              aria-label="Studio background"
            >
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  role="radio"
                  aria-checked={background === b.value}
                  aria-label={b.value}
                  onClick={() => setBackground(b.value)}
                  className={cn(
                    "group flex flex-col items-center gap-1 rounded-lg p-1 outline-none",
                    "focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                >
                  <span
                    style={{ backgroundImage: b.swatch }}
                    className={cn(
                      "aspect-square w-full rounded-md ring-1 ring-inset ring-black/10 transition-all",
                      background === b.value
                        ? "ring-2 ring-brand"
                        : "group-hover:ring-muted-foreground/40",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] leading-tight",
                      background === b.value
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3" aria-hidden="true" />
              Category is auto-detected from your photo.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Output</Label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Output resolution">
              {OUTPUTS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={resolution === o.value}
                  onClick={() => setResolution(o.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition-colors duration-150 outline-none",
                    "focus-visible:ring-3 focus-visible:ring-ring/50",
                    resolution === o.value
                      ? "border-brand/50 bg-brand/10"
                      : "border-border bg-card hover:border-muted-foreground/40",
                  )}
                >
                  <span className="flex items-center justify-between text-sm font-medium text-foreground">
                    {o.title}
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {o.value}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                    {o.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost</span>
              <span className="font-medium">1 credit</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Balance after</span>
              <span className="font-medium tabular-nums">
                {Math.max(0, sim.creditsBalance - 1)} credits
              </span>
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={!canGenerate}
              onClick={() => { void generate(); }}
            >
              <Sparkles aria-hidden="true" />
              {generating ? "Uploading…" : "Generate 360° assets"}
            </Button>
            {sim.creditsBalance === 0 && (
              activeSimJob ? (
                <p className="text-center text-xs text-muted-foreground">
                  Render in progress —{" "}
                  <Link
                    href={`/products/${activeSimJob.productId}`}
                    className="underline underline-offset-2"
                  >
                    check progress
                  </Link>
                </p>
              ) : (
                <p className="text-center text-xs text-destructive">
                  You&apos;re out of credits —{" "}
                  <Link href="/credits" className="underline underline-offset-2">
                    buy more
                  </Link>{" "}
                  to keep rendering.
                </p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
