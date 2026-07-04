"use client";

import * as React from "react";
import { ArrowRight, ImageIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVideoPoster } from "@/lib/media/video-frames";

const DEMO_VIDEO = "/demo/bed.mp4";

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
            alt="Single source photo of the Solvei upholstered bed"
            className="aspect-square w-full rounded-lg bg-[#f4f2ee] object-cover"
          />
        ) : (
          <Skeleton className="aspect-square w-full rounded-lg" />
        )}
        <figcaption className="flex items-center gap-1.5 px-1.5 py-2 font-mono text-[11px] text-muted-foreground">
          <ImageIcon className="size-3" aria-hidden="true" />
          solvei-dove-front.jpg · the only input
        </figcaption>
      </div>
    </figure>
  );
}

function FramesStrip() {
  const [frames, setFrames] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Local import avoids pulling capture code until the tab is opened.
    let cancel = () => {};
    void import("@/lib/media/video-frames").then(({ captureFrames }) => {
      cancel = captureFrames(DEMO_VIDEO, 12, 240, (frame) =>
        setFrames((prev) => [...prev, frame.url]),
      );
    });
    return () => cancel();
  }, []);

  return (
    <div className="grid aspect-[16/10] w-full grid-cols-4 content-center gap-2 overflow-hidden rounded-2xl border border-border bg-[#0d0d0d] p-4">
      {Array.from({ length: 12 }).map((_, i) =>
        frames[i] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={frames[i]}
            alt=""
            className="aspect-square w-full rounded-md border border-border object-cover"
          />
        ) : (
          <Skeleton key={i} className="aspect-square w-full rounded-md" />
        ),
      )}
    </div>
  );
}

export function Demo() {
  return (
    <section id="demo" className="scroll-mt-24 py-24">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">Live demo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            One photo in. This comes out.
          </h2>
          <p className="mt-4 text-muted-foreground">
            An upholstered bed from a Fernhaven Home catalog shot — rendered in
            10 minutes 55 seconds. Everything below is interactive.
          </p>
        </Reveal>

        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_auto_minmax(0,3fr)]">
          <Reveal>
            <SourcePhoto />
          </Reveal>

          <Reveal delay={0.1} className="flex justify-center">
            <div className="flex items-center gap-2 text-muted-foreground lg:flex-col">
              <span className="font-mono text-[11px] tracking-wider uppercase">
                11 min
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
            <Tabs defaultValue="viewer">
              <div className="flex items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="viewer">360° viewer</TabsTrigger>
                  <TabsTrigger value="video">Orbit video</TabsTrigger>
                  <TabsTrigger value="frames">Frames</TabsTrigger>
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
                  productName="Solvei Upholstered Bed"
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
            </Tabs>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
