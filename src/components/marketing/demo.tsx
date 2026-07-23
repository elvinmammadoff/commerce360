"use client";

import * as React from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { SectionGlow } from "@/components/marketing/section-glow";
import { SectionHeader } from "@/components/marketing/section-header";
import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import { Model3DViewer } from "@/components/app/viewer/model-viewer-3d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CapturedFrame } from "@/lib/media/video-frames";
import { getVideoPoster } from "@/lib/media/video-frames";

const DEMO_VIDEO = "https://orbittify.com/api/uploads/videos/f734e8e8-e892-42fb-934c-223bee54fbf0.mp4";
const DEMO_MODEL = "https://orbittify.com/api/uploads/models/f734e8e8-e892-42fb-934c-223bee54fbf0/model.glb";

/** The "before" — a single flat catalog photo, captured from the orbit. */
function SourcePhoto() {
  const [poster, setPoster] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getVideoPoster(DEMO_VIDEO, 640)
      .then((url) => active && setPoster(url))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <figure className="mx-auto w-full max-w-70">
      <div className="rotate-[-1.5deg] rounded-xl border border-border bg-card p-2 shadow-lg transition-transform duration-250 hover:rotate-0">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt="Single source photo of the Ps 74 315 lounge chair"
            className="aspect-square w-full rounded-lg bg-[#f4f2ee] object-cover"
          />
        ) : (
          <Skeleton className="aspect-square w-full rounded-lg" />
        )}
        <figcaption className="flex items-center gap-1.5 px-1.5 py-2 font-mono text-[11px] text-muted-foreground">
          <ImageIcon className="size-3" aria-hidden="true" />
          ps_74_315.jpg · the only input
        </figcaption>
      </div>
    </figure>
  );
}

const FRAME_COUNT = 72;

function FramesStrip() {
  const [frames, setFrames] = React.useState<CapturedFrame[]>([]);
  const [selected, setSelected] = React.useState<CapturedFrame | null>(null);

  React.useEffect(() => {
    let cancel = () => {};
    void import("@/lib/media/video-frames").then(({ captureFrames }) => {
      cancel = captureFrames(DEMO_VIDEO, FRAME_COUNT, 240, (frame) =>
        setFrames((prev) => [...prev, frame]),
      );
    });
    return () => cancel();
  }, []);

  const goTo = React.useCallback(
    (offset: number) => {
      if (!selected) return;
      const next = (selected.index + offset + FRAME_COUNT) % FRAME_COUNT;
      const frame = frames[next];
      if (frame) setSelected(frame);
    },
    [selected, frames],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key === "ArrowRight") goTo(1);
      if (e.key === "ArrowLeft") goTo(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, goTo]);

  return (
    <>
      <div className="overflow-y-auto rounded-2xl border border-border bg-[#0d0d0d] p-3" style={{ maxHeight: 480 }}>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
          {Array.from({ length: FRAME_COUNT }).map((_, i) => {
            const frame = frames[i];
            return frame ? (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(frame)}
                className="group relative block overflow-hidden rounded-md border border-white/10 outline-none transition-all hover:border-white/40 focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label={`Frame ${i + 1}, ${frame.angle}°`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.url}
                  alt=""
                  draggable={false}
                  className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <span className="absolute right-0.5 bottom-0.5 rounded bg-black/70 px-1 font-mono text-[8px] text-white/70 tabular-nums">
                  {frame.angle}°
                </span>
              </button>
            ) : (
              <Skeleton
                key={i}
                className="aspect-square w-full rounded-md opacity-20"
              />
            );
          })}
        </div>
        <p className="mt-2 text-center font-mono text-[10px] text-white/30 tabular-nums">
          {frames.length}/{FRAME_COUNT} loaded
        </p>
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Frame {(selected?.index ?? 0) + 1} of {FRAME_COUNT}
            </DialogTitle>
            <DialogDescription>
              Ps 74 315 · {selected?.angle}° · use ← → to navigate
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.url}
                alt={`Ps 74 315 at ${selected.angle} degrees`}
                className="w-full rounded-lg border border-border"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={() => goTo(-1)}
                  aria-label="Previous frame"
                >
                  <ChevronLeft className="size-4" />
                </Button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={() => goTo(1)}
                  aria-label="Next frame"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Demo() {
  return (
    <section id="demo" className="relative scroll-mt-24 py-24 sm:py-28">
      <SectionGlow placement="top-right" tone="indigo" size="40rem" intensity={0.09} />
      <div className="container-page">
        <SectionHeader
          eyebrow="Live demo"
          title="One photo in. This comes out."
          description="A lounge chair from a product photo — one image in, one credit spent. 360° orbit, 72 frames, and a 3D model. Everything below is interactive."
        />

        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_auto_minmax(0,3fr)]">
          <Reveal>
            <SourcePhoto />
          </Reveal>

          <Reveal delay={0.1} className="flex justify-center">
            <div className="flex items-center gap-2 text-muted-foreground lg:flex-col">
              <span className="font-mono text-[11px] tracking-wider uppercase">
                ~14 min
              </span>
              <ArrowRight
                className="size-5 text-brand max-lg:rotate-90 lg:rotate-0"
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] tracking-wider uppercase">
                1 credit
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <Tabs defaultValue="video">
              <div className="flex items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="viewer">360° viewer</TabsTrigger>
                  <TabsTrigger value="video">Orbit video</TabsTrigger>
                  <TabsTrigger value="frames">Frames</TabsTrigger>
                  <TabsTrigger value="model">3D model</TabsTrigger>
                </TabsList>
                <Badge
                  variant="outline"
                  className="hidden border-success/25 bg-success/10 font-mono text-[11px] text-success sm:inline-flex"
                >
                  Real output
                </Badge>
              </div>
              <TabsContent value="viewer" className="mt-3">
                <TurntableViewer
                  src={DEMO_VIDEO}
                  productName="Ps 74 315"
                  compact
                  className="aspect-[16/10] w-full"
                />
              </TabsContent>
              <TabsContent value="video" className="mt-3">
                <video
                  src={DEMO_VIDEO}
                  autoPlay
                  controls
                  loop
                  muted
                  playsInline
                  className="aspect-[16/10] w-full rounded-2xl border border-border bg-[#0d0d0d] object-contain"
                />
              </TabsContent>
              <TabsContent value="frames" className="mt-3">
                <FramesStrip />
              </TabsContent>
              <TabsContent value="model" className="mt-3">
                <Model3DViewer src={DEMO_MODEL} />
              </TabsContent>
            </Tabs>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
