"use client";

import * as React from "react";
import { Maximize2, Minimize2, Move3d, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Hotspot } from "@/lib/types";

/** Angular half-window (degrees) over which a hotspot fades in and out. */
const HOTSPOT_WINDOW = 32;

/** Shortest signed angle (−180..180) from `from` to `to`. */
function angleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

/** Full drag across the stage ≈ one and a bit rotations — feels 1:1. */
const DRAG_ROTATIONS_PER_WIDTH = 1.15;
/** Inertia decay per frame (~60fps). */
const FRICTION = 0.94;
const MIN_VELOCITY = 0.00035;

export interface TurntableViewerProps {
  src: string;
  frameCount?: number;
  className?: string;
  /** Start the orbit spinning on load (pauses on first interaction). */
  autoRotate?: boolean;
  /** Compact HUD for embeds (landing hero). */
  compact?: boolean;
  productName?: string;
  /** Interactive hotspots overlaid on the stage, gated by orbit angle. */
  hotspots?: Hotspot[];
  /** Reports the live orbit angle (degrees) — used by the hotspot editor. */
  onAngleChange?: (angle: number) => void;
}

function wrapTime(time: number, duration: number): number {
  const safeEnd = Math.max(duration - 0.04, 0);
  const wrapped = ((time % duration) + duration) % duration;
  return Math.min(wrapped, safeEnd);
}

export function TurntableViewer({
  src,
  frameCount = 72,
  className,
  autoRotate = false,
  compact = false,
  productName = "Product",
  hotspots,
  onAngleChange,
}: TurntableViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const onAngleChangeRef = React.useRef(onAngleChange);
  onAngleChangeRef.current = onAngleChange;

  const [ready, setReady] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [interacted, setInteracted] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [angle, setAngle] = React.useState(0);

  const drag = React.useRef({
    active: false,
    startX: 0,
    startTime: 0,
    lastX: 0,
    lastMoveAt: 0,
    velocity: 0, // seconds of video per ms of pointer travel time
  });
  const inertiaRaf = React.useRef<number | null>(null);
  const hudRaf = React.useRef<number | null>(null);
  /** Whether rotation should be running (user/autoRotate intent). */
  const wantPlayRef = React.useRef(false);
  /** Whether the stage is on screen — offscreen videos stay paused. */
  const inViewRef = React.useRef(false);

  const stopInertia = React.useCallback(() => {
    if (inertiaRaf.current !== null) {
      cancelAnimationFrame(inertiaRaf.current);
      inertiaRaf.current = null;
    }
  }, []);

  // Angle HUD — poll currentTime on rAF only while something can move.
  React.useEffect(() => {
    const tick = () => {
      const video = videoRef.current;
      if (video && video.duration > 0) {
        const a = ((video.currentTime / video.duration) * 360) % 360;
        setAngle(a);
        onAngleChangeRef.current?.(a);
      }
      hudRaf.current = requestAnimationFrame(tick);
    };
    hudRaf.current = requestAnimationFrame(tick);
    return () => {
      if (hudRaf.current !== null) cancelAnimationFrame(hudRaf.current);
    };
  }, []);

  React.useEffect(() => {
    const onFullscreenChange = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const prefersReducedMotion = React.useRef(false);
  React.useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const play = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    stopInertia();
    wantPlayRef.current = true;
    if (inViewRef.current) void video.play().catch(() => {});
  }, [stopInertia]);

  const pause = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    wantPlayRef.current = false;
    video.pause();
  }, []);

  const handleReady = React.useCallback(() => {
    setReady(true);
    if (autoRotate && !prefersReducedMotion.current) play();
  }, [autoRotate, play]);

  // The load events can fire before hydration attaches listeners (fast
  // local assets, HMR) — reconcile readiness on mount.
  React.useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) handleReady();
  }, [handleReady]);

  // Browsers pause offscreen muted autoplay — cooperate instead of fighting:
  // pause when the stage scrolls out, resume intent when it returns.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          if (wantPlayRef.current && video.paused) {
            void video.play().catch(() => {});
          }
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Chrome pauses hidden-tab videos and won't resume them — do it ourselves.
  React.useEffect(() => {
    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (
        !document.hidden &&
        wantPlayRef.current &&
        inViewRef.current &&
        video?.paused
      ) {
        void video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const scrubBy = React.useCallback((deltaSeconds: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = wrapTime(video.currentTime + deltaSeconds, video.duration);
  }, []);

  const startInertia = React.useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    let velocity = drag.current.velocity * 16; // seconds of video per ~16.7ms frame
    if (Math.abs(velocity) < MIN_VELOCITY * 16) return;

    let last = performance.now();
    const step = (now: number) => {
      // Time-based decay keeps the glide identical at any frame rate.
      const frames = (now - last) / 16.7;
      last = now;
      velocity *= Math.pow(FRICTION, frames);
      if (Math.abs(velocity) < MIN_VELOCITY) {
        inertiaRaf.current = null;
        return;
      }
      scrubBy(velocity * frames);
      inertiaRaf.current = requestAnimationFrame(step);
    };
    inertiaRaf.current = requestAnimationFrame(step);
  }, [scrubBy]);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Capture is best-effort — drag still works without it.
      }
      stopInertia();
      pause();
      setInteracted(true);
      drag.current = {
        active: true,
        startX: e.clientX,
        startTime: video.currentTime,
        lastX: e.clientX,
        lastMoveAt: performance.now(),
        velocity: 0,
      };
    },
    [pause, stopInertia],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (!video || !container || !drag.current.active || !video.duration) return;

      const rect = container.getBoundingClientRect();
      const dx = e.clientX - drag.current.startX;
      const deltaTime =
        -(dx / rect.width) * video.duration * DRAG_ROTATIONS_PER_WIDTH;
      video.currentTime = wrapTime(
        drag.current.startTime + deltaTime,
        video.duration,
      );

      const nowMs = performance.now();
      const dt = nowMs - drag.current.lastMoveAt;
      if (dt > 0) {
        const instantVelocity =
          (-(e.clientX - drag.current.lastX) / rect.width) *
          video.duration *
          DRAG_ROTATIONS_PER_WIDTH;
        drag.current.velocity = instantVelocity / dt;
        drag.current.lastX = e.clientX;
        drag.current.lastMoveAt = nowMs;
      }
    },
    [],
  );

  const onPointerUp = React.useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (!prefersReducedMotion.current) startInertia();
  }, [startInertia]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
      const frameStep = video.duration / frameCount;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          stopInertia();
          pause();
          setInteracted(true);
          scrubBy(frameStep);
          break;
        case "ArrowLeft":
          e.preventDefault();
          stopInertia();
          pause();
          setInteracted(true);
          scrubBy(-frameStep);
          break;
        case " ":
          e.preventDefault();
          setInteracted(true);
          if (playing) pause();
          else play();
          break;
        case "Home":
          e.preventDefault();
          stopInertia();
          pause();
          video.currentTime = 0;
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frameCount, pause, play, playing, scrubBy],
  );

  const toggleFullscreen = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement === container) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen().catch(() => {});
    }
  }, []);

  const currentFrame = Math.min(
    frameCount,
    Math.floor((angle / 360) * frameCount) + 1,
  );

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={`360° viewer for ${productName}. Drag or use arrow keys to rotate, Space to auto-rotate, F for fullscreen.`}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(angle)}
      aria-valuetext={`${Math.round(angle)} degrees`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onDoubleClick={toggleFullscreen}
      className={cn(
        "group relative isolate touch-none overflow-hidden rounded-2xl border border-border bg-[#0d0d0d] outline-none select-none",
        "cursor-grab active:cursor-grabbing",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        fullscreen && "flex items-center justify-center rounded-none border-none bg-black",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        onLoadedData={handleReady}
        onCanPlay={handleReady}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-hidden="true"
        draggable={false}
        className={cn(
          "size-full object-contain transition-opacity duration-300",
          fullscreen && "max-h-svh",
          ready ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Hotspot overlay — each marker fades in as the orbit reaches its angle */}
      {ready && hotspots && hotspots.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          {hotspots.map((h) => {
            const delta = angleDelta(angle, h.angle);
            const near = Math.abs(delta) <= HOTSPOT_WINDOW;
            if (!near) return null;
            const opacity = 1 - Math.abs(delta) / HOTSPOT_WINDOW;
            const Tag = h.href ? "a" : "button";
            return (
              <Tag
                key={h.id}
                {...(h.href
                  ? { href: h.href, target: "_blank", rel: "noopener noreferrer" }
                  : { type: "button" as const })}
                onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  opacity,
                }}
                className="pointer-events-auto absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-white/20 bg-black/70 py-1 pr-2.5 pl-1 text-xs text-white shadow-lg backdrop-blur-sm transition-transform duration-150 hover:scale-105"
                aria-label={h.label}
              >
                <span className="relative flex size-4 items-center justify-center">
                  <span className="absolute inline-flex size-4 animate-ping rounded-full bg-brand/60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
                </span>
                <span className="max-w-40 truncate font-medium">{h.label}</span>
              </Tag>
            );
          })}
        </div>
      )}

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="flex flex-col items-center gap-3">
            <div className="size-6 animate-spin rounded-full border-2 border-border border-t-brand" />
            <p className="text-xs text-muted-foreground">Loading viewer…</p>
          </div>
        </div>
      )}

      {/* Drag hint — fades after first interaction */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-4 flex justify-center transition-opacity duration-300",
          interacted || !ready ? "opacity-0" : "opacity-100",
        )}
      >
        <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">
          <Move3d className="size-3.5" />
          Drag to rotate
        </span>
      </div>

      {/* HUD */}
      {ready && (
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/55 p-1 backdrop-blur-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-full text-white hover:bg-white/15 hover:text-white"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                setInteracted(true);
                if (playing) pause();
                else play();
              }}
              aria-label={playing ? "Pause rotation" : "Auto-rotate"}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
          </div>

          <div
            aria-hidden="true"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 backdrop-blur-sm"
          >
            <svg viewBox="0 0 16 16" className="size-3.5">
              <circle
                cx="8"
                cy="8"
                r="6.4"
                fill="none"
                className="stroke-white/25"
                strokeWidth="1.4"
              />
              <circle
                cx={8 + 6.4 * Math.sin((angle * Math.PI) / 180)}
                cy={8 - 6.4 * Math.cos((angle * Math.PI) / 180)}
                r="2"
                className="fill-brand"
              />
            </svg>
            <span className="font-mono text-[11px] text-white/85 tabular-nums">
              {Math.round(angle).toString().padStart(3, "0")}°
            </span>
            {!compact && (
              <>
                <span className="text-white/25">·</span>
                <span className="font-mono text-[11px] text-white/85 tabular-nums">
                  {String(currentFrame).padStart(2, "0")}/{frameCount}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/55 p-1 backdrop-blur-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-full text-white hover:bg-white/15 hover:text-white"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
