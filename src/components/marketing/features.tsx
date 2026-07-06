"use client";

import * as React from "react";
import { Code2, Film, Images, Rotate3d, Share2, Store } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { SectionHeader } from "@/components/marketing/section-header";
import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared bento cell — hairline surface, quiet hover lift, top-aligned copy. */
function Cell({
  className,
  children,
  index,
}: {
  className?: string;
  children: React.ReactNode;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      {...(reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 16 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-60px" },
            transition: { duration: 0.5, delay: index * 0.05, ease: EASE },
          })}
      className={cn(
        "group/cell relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10",
        "shadow-[inset_0_1px_0_0_color-mix(in_oklch,white_4%,transparent)]",
        "transition-[box-shadow,border-color] duration-300 hover:ring-brand/25 hover:elevate-md",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function CellText({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col p-6">
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-brand" aria-hidden />
        <h3 className="text-[15px] font-medium tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-border bg-[#070707] py-24 sm:py-28"
    >
      <div className="container-page">
        <SectionHeader
          eyebrow="Everything included"
          title="One render. Every format your channels ask for."
          description="Each credit produces the complete set — no add-ons, no per-format pricing."
        />

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-[repeat(2,13.5rem)_auto]">
          {/* Signature: the real interactive viewer */}
          <Cell
            index={0}
            className="sm:col-span-2 lg:col-start-1 lg:col-end-4 lg:row-start-1 lg:row-end-3"
          >
            <div className="relative flex-1 p-2">
              <TurntableViewer
                src="/demo/bed.mp4"
                autoRotate
                compact
                productName="Solvei Upholstered Bed"
                className="size-full min-h-56 rounded-xl"
              />
            </div>
            <CellText icon={Rotate3d} title="Interactive 360° viewer">
              Drag-to-rotate, keyboard accessible, a 28&nbsp;KB embed. Drops into
              Shopify, WooCommerce, or any PDP with one snippet.
            </CellText>
          </Cell>

          {/* Orbit video — filmstrip motif */}
          <Cell index={1} className="lg:col-start-4 lg:col-end-7 lg:row-start-1">
            <div className="relative min-h-28 flex-1 overflow-hidden px-6 pt-6">
              <div className="flex h-full items-center gap-1.5 mask-fade-x">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 flex-1 rounded-md bg-gradient-to-b from-white/[0.06] to-transparent ring-1 ring-inset ring-white/5"
                    style={{ opacity: 1 - Math.abs(i - 4) * 0.09 }}
                  />
                ))}
                <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Film className="size-4" aria-hidden />
                  </span>
                </div>
              </div>
            </div>
            <CellText icon={Film} title="4K orbit video">
              A seamless loop for product pages, paid social, and retail screens.
              H.265, alpha-ready, broadcast clean.
            </CellText>
          </Cell>

          {/* Studio frames — mini grid motif */}
          <Cell index={2} className="lg:col-start-4 lg:col-end-7 lg:row-start-2">
            <div className="relative min-h-28 flex-1 overflow-hidden px-6 pt-6">
              <div className="grid h-full min-h-24 grid-cols-8 grid-rows-2 gap-1.5 mask-fade-x">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-[5px] ring-1 ring-inset ring-white/5",
                      i === 3 || i === 10
                        ? "bg-brand/25 ring-brand/40"
                        : "bg-white/[0.05]",
                    )}
                  />
                ))}
              </div>
            </div>
            <CellText icon={Images} title="72 studio frames">
              Every 5° at 2048² and up, color-matched to the source photo. Pick
              hero angles in seconds.
            </CellText>
          </Cell>

          {/* Marketplace sets — spec chips */}
          <Cell index={3} className="lg:col-start-1 lg:col-end-3 lg:row-start-3">
            <div className="flex flex-1 flex-wrap content-start gap-1.5 px-6 pt-6">
              {["Amazon", "Shopify", "Etsy", "Wayfair"].map((m) => (
                <span
                  key={m}
                  className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-muted-foreground ring-1 ring-inset ring-white/8"
                >
                  {m}
                </span>
              ))}
            </div>
            <CellText icon={Store} title="Marketplace sets">
              Exported to each spec automatically — white backgrounds, exact
              dimensions, zero cropping.
            </CellText>
          </Cell>

          {/* API — code motif */}
          <Cell index={4} className="lg:col-start-3 lg:col-end-5 lg:row-start-3">
            <div className="flex-1 px-6 pt-6">
              <pre className="overflow-hidden rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground ring-1 ring-inset ring-white/8">
                <span className="text-success">POST</span> /v1/renders
                {"\n"}
                <span className="text-brand">on</span> publish → webhook
              </pre>
            </div>
            <CellText icon={Code2} title="API & webhooks">
              Render on publish: connect your PIM and new SKUs come out with full
              asset sets.
            </CellText>
          </Cell>

          {/* Share & team — avatar stack */}
          <Cell index={5} className="lg:col-start-5 lg:col-end-7 lg:row-start-3">
            <div className="flex flex-1 items-center px-6 pt-6">
              <div className="flex -space-x-2">
                {["ML", "DW", "PN", "SA"].map((a, i) => (
                  <span
                    key={a}
                    className="flex size-8 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-foreground ring-2 ring-card"
                    style={{ zIndex: 4 - i }}
                  >
                    {a}
                  </span>
                ))}
                <span className="flex size-8 items-center justify-center rounded-full bg-white/[0.04] text-[11px] text-muted-foreground ring-2 ring-card">
                  +6
                </span>
              </div>
            </div>
            <CellText icon={Share2} title="Share pages & team">
              Hosted viewer pages for buyers and sign-off, with roles, version
              history, and re-renders built in.
            </CellText>
          </Cell>
        </div>
      </div>
    </section>
  );
}
