"use client";

import * as React from "react";
import { Box, Code2, Film, Images, Rotate3d, Share2, Store } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { GradientBorder } from "@/components/marketing/gradient-border";
import { SectionGlow } from "@/components/marketing/section-glow";
import { SectionHeader } from "@/components/marketing/section-header";
import { Spotlight } from "@/components/marketing/spotlight";
import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Feature icon tints walk blue → violet across the grid, echoing the brand
 *  gradient used in the hero stats and product pipeline (was a flat blue). */
const FEATURE_TINTS = [
  "bg-[#5B8CFF]/12 text-[#7ba3ff] ring-[#5B8CFF]/25",
  "bg-[#6582fd]/12 text-[#8399fe] ring-[#6582fd]/25",
  "bg-[#6e79fb]/12 text-[#9098fc] ring-[#6e79fb]/25",
  "bg-[#786ffa]/12 text-[#a08cfb] ring-[#786ffa]/25",
  "bg-[#8166f8]/12 text-[#ab84fa] ring-[#8166f8]/25",
  "bg-[#8B5CF6]/12 text-[#a78bfa] ring-[#8B5CF6]/25",
  "bg-[#9553f4]/12 text-[#b47cf6] ring-[#9553f4]/25",
] as const;

/** Shared bento cell — hairline surface, cursor spotlight, quiet hover lift. */
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
            whileHover: {
              y: -4,
              transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
            },
          })}
      className={cn(
        "group/cell relative isolate flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10",
        "shadow-[inset_0_1px_0_0_color-mix(in_oklch,white_4%,transparent)]",
        "transition-[box-shadow,--tw-ring-color] duration-300 hover:ring-brand/30 hover:elevate-lg",
        className,
      )}
    >
      <Spotlight className="opacity-0 transition-opacity duration-300 group-hover/cell:opacity-100" />
      <GradientBorder className="opacity-0 transition-opacity duration-300 group-hover/cell:opacity-100" />
      {children}
    </motion.div>
  );
}

function CellText({
  icon: Icon,
  title,
  tint,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col p-6">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1",
            tint,
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
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
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      className="relative scroll-mt-24 py-24 sm:py-28"
    >
      <div aria-hidden="true" className="divider-glow absolute inset-x-0 top-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(680px_220px_at_50%_0,rgba(91,140,255,0.06),transparent)]"
      />
      {/* Faint diagonal wave streaks, masked to the upper band. */}
      <div
        aria-hidden="true"
        className="bg-streaks pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-30 blur-[1px] [mask-image:radial-gradient(720px_320px_at_70%_0,black,transparent_75%)]"
      />
      <SectionGlow placement="bottom-left" tone="blue" size="42rem" intensity={0.08} />
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
                src="https://orbittify.com/api/uploads/videos/d436b6f9-c68e-4ddb-af6e-431a398ab754.mp4"
                autoRotate
                compact
                productName="Cross Stul 1"
                className="size-full min-h-56 rounded-xl"
              />
            </div>
            <CellText icon={Rotate3d} title="Interactive 360° viewer" tint={FEATURE_TINTS[0]}>
              Drag-to-rotate, keyboard accessible, a 28&nbsp;KB embed. Drops into
              Shopify, WooCommerce, or any PDP with one snippet.
            </CellText>
          </Cell>

          {/* Orbit video — filmstrip motif */}
          <Cell index={1} className="lg:col-start-4 lg:col-end-7 lg:row-start-1">
            <div className="relative min-h-28 flex-1 overflow-hidden px-6 pt-6">
              <div className="flex h-full items-center gap-1.5 mask-fade-x">
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.div
                    key={i}
                    {...(reduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, scaleY: 0.5 },
                          whileInView: {
                            opacity: 1 - Math.abs(i - 4) * 0.09,
                            scaleY: 1,
                          },
                          viewport: { once: true, margin: "-40px" },
                          transition: {
                            duration: 0.4,
                            delay: Math.abs(i - 4) * 0.045,
                            ease: EASE,
                          },
                        })}
                    className="h-16 flex-1 rounded-md bg-gradient-to-b from-white/[0.06] to-transparent ring-1 ring-inset ring-white/5"
                    style={reduceMotion ? { opacity: 1 - Math.abs(i - 4) * 0.09 } : undefined}
                  />
                ))}
                <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
                  <motion.span
                    {...(reduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, scale: 0.6 },
                          whileInView: { opacity: 1, scale: 1 },
                          viewport: { once: true },
                          transition: { duration: 0.4, delay: 0.25, ease: EASE },
                        })}
                    className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                  >
                    <Film className="size-4" aria-hidden />
                  </motion.span>
                </div>
              </div>
            </div>
            <CellText icon={Film} title="4K orbit video" tint={FEATURE_TINTS[1]}>
              A seamless loop for product pages, paid social, and retail screens.
              H.265, alpha-ready, broadcast clean.
            </CellText>
          </Cell>

          {/* Studio frames — mini grid motif */}
          <Cell index={2} className="lg:col-start-4 lg:col-end-7 lg:row-start-2">
            <div className="relative min-h-28 flex-1 overflow-hidden px-6 pt-6">
              <div className="grid h-full min-h-24 grid-cols-8 grid-rows-2 gap-1.5 mask-fade-x">
                {Array.from({ length: 16 }).map((_, i) => (
                  <motion.div
                    key={i}
                    {...(reduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, scale: 0.6 },
                          whileInView: { opacity: 1, scale: 1 },
                          viewport: { once: true, margin: "-40px" },
                          transition: {
                            duration: 0.3,
                            delay: i * 0.022,
                            ease: EASE,
                          },
                        })}
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
            <CellText icon={Images} title="72 studio frames" tint={FEATURE_TINTS[2]}>
              Every 5° at 3840×3840, color-matched to the source photo. Pick
              hero angles in seconds.
            </CellText>
          </Cell>

          {/* Marketplace sets — spec chips */}
          <Cell index={3} className="lg:col-start-1 lg:col-end-3 lg:row-start-3">
            <div className="flex flex-1 flex-wrap content-start gap-1.5 px-6 pt-6">
              {["Amazon", "Shopify", "Etsy", "Wayfair", "Trendyol", "Hepsiburada"].map((m, i) => (
                <motion.span
                  key={m}
                  {...(reduceMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 8 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: true, margin: "-40px" },
                        transition: { duration: 0.35, delay: i * 0.07, ease: EASE },
                      })}
                  className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-muted-foreground ring-1 ring-inset ring-white/8"
                >
                  {m}
                </motion.span>
              ))}
            </div>
            <CellText icon={Store} title="Marketplace sets" tint={FEATURE_TINTS[3]}>
              Exported to each spec automatically — white backgrounds, exact
              dimensions, zero cropping.
            </CellText>
          </Cell>

          {/* API — code motif */}
          <Cell index={4} className="lg:col-start-3 lg:col-end-5 lg:row-start-3">
            <motion.div
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 10 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: "-40px" },
                    transition: { duration: 0.45, delay: 0.1, ease: EASE },
                  })}
              className="flex-1 px-6 pt-6"
            >
              <pre className="overflow-hidden rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground ring-1 ring-inset ring-white/8">
                <span className="text-success">POST</span> /v1/renders
                {"\n"}
                <span className="text-brand">on</span> publish → webhook
              </pre>
            </motion.div>
            <CellText icon={Code2} title="API & webhooks" tint={FEATURE_TINTS[4]}>
              Render on publish: connect your PIM and new SKUs come out with full
              asset sets.
            </CellText>
          </Cell>

          {/* 3D model add-on — perspective mesh motif */}
          <Cell index={6} className="lg:col-span-6 lg:row-start-4">
            <div
              className="relative min-h-28 flex-1 overflow-hidden px-6 pt-6"
              style={{ perspective: "320px" }}
            >
              <div
                className="grid h-full min-h-24 grid-cols-8 grid-rows-2 gap-1.5 mask-fade-x"
                style={{ transform: "rotateX(22deg) rotateY(-10deg) scale(0.96)" }}
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <motion.div
                    key={i}
                    {...(reduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, scale: 0.6 },
                          whileInView: { opacity: 1, scale: 1 },
                          viewport: { once: true, margin: "-40px" },
                          transition: { duration: 0.3, delay: i * 0.022, ease: EASE },
                        })}
                    className={cn(
                      "rounded-[5px] ring-1 ring-inset ring-white/5",
                      [1, 6, 9].includes(i)
                        ? "bg-[#9553f4]/25 ring-[#9553f4]/40"
                        : [3, 12].includes(i)
                          ? "bg-brand/20 ring-brand/35"
                          : "bg-white/[0.05]",
                    )}
                  />
                ))}
              </div>
            </div>
            <CellText icon={Box} title="3D model add-on" tint={FEATURE_TINTS[6]}>
              A textured GLB generated from the same studio render — load it in AR Quick Look, Blender,
              Three.js, or any game engine. Activate per product.
            </CellText>
          </Cell>

          {/* Share & team — avatar stack */}
          <Cell index={5} className="lg:col-start-5 lg:col-end-7 lg:row-start-3">
            <div className="flex flex-1 items-center px-6 pt-6">
              <div className="flex -space-x-2">
                {["ML", "DW", "PN", "SA"].map((a, i) => (
                  <motion.span
                    key={a}
                    {...(reduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, x: -10 },
                          whileInView: { opacity: 1, x: 0 },
                          viewport: { once: true, margin: "-40px" },
                          transition: { duration: 0.35, delay: i * 0.07, ease: EASE },
                        })}
                    className="flex size-8 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-foreground ring-2 ring-card"
                    style={{ zIndex: 4 - i }}
                  >
                    {a}
                  </motion.span>
                ))}
                <motion.span
                  {...(reduceMotion
                    ? {}
                    : {
                        initial: { opacity: 0, x: -10 },
                        whileInView: { opacity: 1, x: 0 },
                        viewport: { once: true, margin: "-40px" },
                        transition: { duration: 0.35, delay: 0.28, ease: EASE },
                      })}
                  className="flex size-8 items-center justify-center rounded-full bg-white/[0.04] text-[11px] text-muted-foreground ring-2 ring-card"
                >
                  +6
                </motion.span>
              </div>
            </div>
            <CellText icon={Share2} title="Share pages & team" tint={FEATURE_TINTS[5]}>
              Hosted viewer pages for buyers and sign-off, with roles, version
              history, and re-renders built in.
            </CellText>
          </Cell>
        </div>
      </div>
    </section>
  );
}
