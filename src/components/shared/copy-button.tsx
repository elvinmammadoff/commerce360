"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label,
  size = "icon-sm",
}: {
  value: string;
  label: string;
  size?: "icon-xs" | "icon-sm" | "icon";
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={copy}
      aria-label={`Copy ${label.toLowerCase()}`}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
    </Button>
  );
}
