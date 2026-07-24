"use client";

import * as React from "react";
import { Check, TriangleAlert, Download, Lightbulb, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  MarketplaceCheck,
  MarketplacePlatformReport,
  Product,
  ProductAssets,
} from "@/lib/types";

// Bump when any file in public/marketplaces/ changes — busts the browser cache
// so stable filenames still refetch after a logo swap.
const LOGO_VERSION = "2";

// Tasteful brand-coloured marks — not literal trademarked logos.
const BRAND: Record<string, { color: string; mark: string }> = {
  amazon: { color: "#FF9900", mark: "a" },
  shopify: { color: "#95BF47", mark: "S" },
  etsy: { color: "#F1641E", mark: "E" },
  wayfair: { color: "#7F187F", mark: "W" },
  trendyol: { color: "#F27A1A", mark: "t" },
  hepsiburada: { color: "#FF6000", mark: "h" },
};

function readiness(score: number): { label: string; dot: string; text: string; bar: string } {
  if (score >= 90)
    return { label: "Ready to publish", dot: "bg-success", text: "text-success", bar: "bg-success" };
  if (score >= 70)
    return { label: "Needs improvement", dot: "bg-amber-500", text: "text-amber-500", bar: "bg-amber-500" };
  return { label: "Review required", dot: "bg-destructive", text: "text-destructive", bar: "bg-destructive" };
}

/** The highest-weight failing check for one platform, or null if all pass. */
function topIssue(checks: MarketplaceCheck[]): MarketplaceCheck | null {
  return checks
    .filter((c) => !c.pass)
    .sort((a, b) => b.weight - a.weight)[0] ?? null;
}

/** Real self-hosted logo when available (public/marketplaces/{id}.svg),
 *  otherwise a tasteful brand-coloured mark. */
function PlatformLogo({ id }: { id: string }) {
  const b = BRAND[id] ?? { color: "#6b7280", mark: id[0]?.toUpperCase() ?? "?" };
  const [broken, setBroken] = React.useState(false);
  if (broken) {
    return (
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
        style={{ backgroundColor: b.color }}
      >
        {b.mark}
      </span>
    );
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white p-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/marketplaces/${id}.svg?v=${LOGO_VERSION}`}
        alt=""
        className="size-full object-contain"
        onError={() => setBroken(true)}
      />
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = readiness(score);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <defs>
          <linearGradient id="mk-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5b8cff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-border" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          stroke="url(#mk-ring)"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-semibold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
      <span className="sr-only">{r.label}</span>
    </div>
  );
}

function CheckRow({ check }: { check: MarketplaceCheck }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5">
      {check.pass ? (
        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-foreground">{check.name}</span>
          <div className="flex shrink-0 items-center gap-3">
            {check.value && (
              <span className="font-mono text-xs text-muted-foreground">{check.value}</span>
            )}
            <span
              className={cn(
                "text-xs font-medium",
                check.pass ? "text-success" : "text-amber-500",
              )}
            >
              {check.pass ? "Pass" : "Fail"}
            </span>
          </div>
        </div>
        {!check.pass && check.recommendation && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {check.recommendation}
            <span className="ml-1 font-medium text-brand">(potential +{check.weight} pts)</span>
          </p>
        )}
      </div>
    </div>
  );
}

function LegacyFallback({ product }: { product: Product }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <Store className="mx-auto size-8 text-muted-foreground/40" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-foreground">
        Detailed compliance report unavailable
      </p>
      <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
        This marketplace package was generated before per-check reporting was
        introduced. Re-render {product.name} to see the full compliance breakdown.
      </p>
    </div>
  );
}

export function MarketplaceReport({
  product,
  assets,
}: {
  product: Product;
  assets: ProductAssets;
}) {
  const report = assets.marketplaceReport;

  const platformEntries = React.useMemo(
    () =>
      report
        ? (Object.entries(report.platforms) as [string, MarketplacePlatformReport][]).sort(
            (a, b) => a[1].score - b[1].score,
          )
        : [],
    [report],
  );

  const [selected, setSelected] = React.useState<string>(platformEntries[0]?.[0] ?? "");

  // Aggregate failing checks across platforms → the biggest opportunities.
  const opportunities = React.useMemo(() => {
    if (!report) return [];
    const map = new Map<string, { name: string; weight: number; count: number; rec?: string }>();
    for (const p of Object.values(report.platforms)) {
      for (const c of p.checks) {
        if (c.pass) continue;
        const cur = map.get(c.id) ?? { name: c.name, weight: c.weight, count: 0, rec: c.recommendation };
        cur.count += 1;
        map.set(c.id, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.weight - a.weight).slice(0, 3);
  }, [report]);

  if (!report || platformEntries.length === 0) {
    return <LegacyFallback product={product} />;
  }

  const overall = readiness(report.overallScore);
  const current = report.platforms[selected] ?? platformEntries[0][1];
  const currentId = report.platforms[selected] ? selected : platformEntries[0][0];
  const downloadHref = `/api/products/${product.id}/download?type=marketplace`;
  const zipSizeLabel = assets.marketplaceSetSizeMb ? ` (${assets.marketplaceSetSizeMb} MB)` : "";
  const affected = report.highestImpactRule
    ? Object.values(report.platforms).filter((p) =>
        p.checks.some((c) => c.id === report.highestImpactRule!.id && !c.pass),
      ).length
    : 0;

  return (
    <div className="space-y-4">
      {/* Hero: readiness ring + summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
          <ScoreRing score={report.overallScore} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Marketplace readiness</p>
            <span className={cn("mt-0.5 flex items-center gap-1.5 text-sm font-semibold", overall.text)}>
              <span className={cn("size-2 rounded-full", overall.dot)} />
              {overall.label}
            </span>
            <p className="mt-2 text-xs text-muted-foreground">
              {report.highestImpactRule
                ? `Your product meets most requirements, but ${report.highestImpactRule.name.toLowerCase()} is below target on ${affected} of ${platformEntries.length} marketplaces.`
                : "Every compliance check passes across all marketplaces."}
            </p>
          </div>
        </div>

        {/* Biggest opportunities */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-3 text-sm font-medium text-foreground">Biggest opportunities</p>
          {opportunities.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-success">
              <Check className="size-4" aria-hidden="true" /> All checks pass — ready to publish
            </div>
          ) : (
            <ul className="space-y-2.5">
              {opportunities.map((o) => (
                <li key={o.name} className="flex items-start gap-2.5">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-foreground">{o.name}</span>
                      <span className="shrink-0 rounded bg-brand/15 px-1.5 py-0.5 text-xs font-medium text-brand">
                        +{o.weight} pts
                      </span>
                    </div>
                    {o.rec && <p className="mt-0.5 text-xs text-muted-foreground">{o.rec}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Platform overview cards */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Marketplace overview
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {platformEntries.map(([id, p]) => {
            const r = readiness(p.score);
            const issue = topIssue(p.checks);
            const active = id === currentId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  active ? "border-brand/50 bg-brand/5" : "border-border bg-card hover:bg-accent",
                )}
              >
                <div className="flex items-center gap-2">
                  <PlatformLogo id={id} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {p.label}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">{p.score}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-[#8b5cf6]"
                    style={{ width: `${p.score}%` }}
                  />
                </div>
                <p className={cn("mt-1.5 text-[11px] font-medium", r.text)}>{r.label}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {issue ? `Top issue: ${issue.name}` : "No action required"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected platform checks */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <PlatformLogo id={currentId} />
          <p className="text-sm font-medium text-foreground">{current.label} compatibility checks</p>
        </div>
        <div className="divide-y divide-border">
          {current.checks.map((c) => (
            <CheckRow key={c.id} check={c} />
          ))}
        </div>
        <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
          Orbittify compatibility analysis — not official {current.label} policy.
        </p>
      </div>

      {/* Download — secondary */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Download marketplace package</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            All {platformEntries.length} platform images + compliance report · ZIP
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-brand to-[#8b5cf6] text-white hover:opacity-90"
        >
          <a href={downloadHref} download={`${product.shareSlug ?? product.id}-marketplace-set.zip`}>
            <Download aria-hidden="true" /> Download ZIP{zipSizeLabel}
          </a>
        </Button>
      </div>
    </div>
  );
}
