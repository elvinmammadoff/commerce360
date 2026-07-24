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

function readiness(score: number): { label: string; dot: string; text: string } {
  if (score >= 90) return { label: "Ready", dot: "bg-success", text: "text-success" };
  if (score >= 70)
    return { label: "Needs improvement", dot: "bg-amber-500", text: "text-amber-500" };
  return { label: "Review recommended", dot: "bg-destructive", text: "text-destructive" };
}

/** Compliance checks are rule-based pixel measurements — never call them "AI". */
function CheckRow({ check }: { check: MarketplaceCheck }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      {check.pass ? (
        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-foreground">{check.name}</span>
          {check.value && (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {check.value}
            </span>
          )}
        </div>
        {!check.pass && check.recommendation && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {check.recommendation}
            <span className="ml-1 font-medium text-foreground">
              (potential +{check.weight} pts)
            </span>
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
        introduced. Re-render {product.name} to see the full compliance breakdown
        and recommendations.
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

  // Default to the lowest-scoring platform — the most actionable one.
  const [selected, setSelected] = React.useState<string>(
    platformEntries[0]?.[0] ?? "",
  );

  if (!report || platformEntries.length === 0) {
    return <LegacyFallback product={product} />;
  }

  const overall = readiness(report.overallScore);
  const current = report.platforms[selected] ?? platformEntries[0][1];
  const downloadHref = `/api/products/${product.id}/download?type=marketplace`;
  const rule = report.highestImpactRule;

  return (
    <div className="space-y-5">
      {/* Overall readiness */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-sm font-medium text-foreground">Marketplace compliance</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Rule-based checks across {platformEntries.length} platforms
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold text-foreground">
            {report.overallScore}
            <span className="text-base font-normal text-muted-foreground">/100</span>
          </p>
          <span className={cn("flex items-center justify-end gap-1.5 text-xs font-medium", overall.text)}>
            <span className={cn("size-1.5 rounded-full", overall.dot)} />
            {overall.label}
          </span>
        </div>
      </div>

      {/* Key insight — derived by the backend, not computed here */}
      <div className="flex items-start gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
        <p className="text-sm text-foreground">
          {rule ? (
            <>
              Your biggest opportunity is <span className="font-medium">{rule.name}</span>.
              It carries the most weight ({rule.weight} pts) among the checks that
              fail and holds scores down across platforms — fixing it once lifts
              every marketplace at the same time.
            </>
          ) : (
            <>Every compliance check passes across all platforms — your assets are marketplace-ready.</>
          )}
        </p>
      </div>

      {/* Platform overview */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Platforms
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {platformEntries.map(([id, p]) => {
            const r = readiness(p.score);
            const active = id === selected;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-brand/50 bg-brand/5"
                    : "border-border bg-card hover:bg-accent",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">{p.label}</span>
                  <span className={cn("flex items-center gap-1 text-[11px]", r.text)}>
                    <span className={cn("size-1.5 rounded-full", r.dot)} />
                    {r.label}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-sm font-medium text-foreground">
                  {p.score}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compliance checks for the selected platform */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-1 text-sm font-medium text-foreground">
          {current.label} checks
        </p>
        <div className="divide-y divide-border">
          {current.checks.map((c) => (
            <CheckRow key={c.id} check={c} />
          ))}
        </div>
      </div>

      {/* Download — secondary action */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Marketplace package</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Per-platform images + compliance.json · ZIP
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={downloadHref} download={`${product.shareSlug ?? product.id}-marketplace-set.zip`}>
            <Download aria-hidden="true" /> Download
          </a>
        </Button>
      </div>
    </div>
  );
}
