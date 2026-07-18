"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Hotspot } from "@/lib/types";

/**
 * Premium hotspot editor. Adds/edits/removes interactive callouts pinned to
 * the 360° orbit. New hotspots drop at whatever angle the viewer is currently
 * showing, so authoring is "spin to the spot, click add".
 */
export function HotspotEditor({
  hotspots,
  onChange,
  getCurrentAngle,
}: {
  hotspots: Hotspot[];
  onChange: (next: Hotspot[]) => void;
  getCurrentAngle: () => number;
}) {
  const update = (id: string, patch: Partial<Hotspot>) =>
    onChange(hotspots.map((h) => (h.id === id ? { ...h, ...patch } : h)));

  const remove = (id: string) => onChange(hotspots.filter((h) => h.id !== id));

  const add = () => {
    const hotspot: Hotspot = {
      id: `hs_${Date.now().toString(36)}`,
      label: "New hotspot",
      angle: Math.round(getCurrentAngle()),
      x: 50,
      y: 50,
    };
    onChange([...hotspots, hotspot]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hotspots.length} hotspot{hotspots.length === 1 ? "" : "s"} · appear as
          the orbit reaches each angle.
        </p>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus aria-hidden="true" /> Add at current angle
        </Button>
      </div>

      {hotspots.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No hotspots yet. Spin the viewer to a spot, then “Add at current
          angle”.
        </p>
      ) : (
        <ul className="space-y-3">
          {hotspots.map((h) => (
            <li
              key={h.id}
              className="space-y-3 rounded-lg border border-border bg-card/50 p-3"
            >
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor={`${h.id}-label`} className="text-xs">
                    Label
                  </Label>
                  <Input
                    id={`${h.id}-label`}
                    value={h.label}
                    onChange={(e) => update(h.id, { label: e.target.value })}
                    placeholder="Solid oak frame"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(h.id)}
                  aria-label={`Remove ${h.label}`}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <NumberField
                  label="Angle°"
                  value={h.angle}
                  min={0}
                  max={359}
                  onChange={(v) => update(h.id, { angle: v })}
                />
                <NumberField
                  label="X %"
                  value={h.x}
                  min={0}
                  max={100}
                  onChange={(v) => update(h.id, { x: v })}
                />
                <NumberField
                  label="Y %"
                  value={h.y}
                  min={0}
                  max={100}
                  onChange={(v) => update(h.id, { y: v })}
                />
                <div className="space-y-1.5">
                  <Label htmlFor={`${h.id}-href`} className="text-xs">
                    Link
                  </Label>
                  <Input
                    id={`${h.id}-href`}
                    value={h.href ?? ""}
                    onChange={(e) =>
                      update(h.id, { href: e.target.value || undefined })
                    }
                    placeholder="https://…"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isNaN(n)) return;
          onChange(Math.max(min, Math.min(max, n)));
        }}
        className="font-mono"
      />
    </div>
  );
}
