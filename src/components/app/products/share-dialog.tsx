"use client";

import { Share2 } from "lucide-react";

import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";

export function ShareDialog({ product }: { product: Product }) {
  const slug = product.shareSlug ?? product.id;
  const shareUrl = `https://share.commerce360.ai/${slug}`;
  const embedCode = `<iframe
  src="${shareUrl}/embed"
  width="720" height="540"
  style="border:0;border-radius:16px"
  allowfullscreen
  title="${product.name} — 360° view"
></iframe>`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 aria-hidden="true" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share {product.name}</DialogTitle>
          <DialogDescription>
            The hosted viewer page works anywhere — no account needed to view.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-url">Share link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                readOnly
                value={shareUrl}
                className="font-mono text-xs"
                onFocus={(e) => e.currentTarget.select()}
              />
              <CopyButton value={shareUrl} label="Link" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="embed-code">Embed on your product page</Label>
            <div className="flex items-start gap-2">
              <Textarea
                id="embed-code"
                readOnly
                value={embedCode}
                rows={7}
                className="resize-none font-mono text-xs leading-relaxed"
                onFocus={(e) => e.currentTarget.select()}
              />
              <CopyButton value={embedCode} label="Embed code" />
            </div>
            <p className="text-xs text-muted-foreground">
              Responsive, keyboard-accessible, and lazy-loaded — adds ~28 KB to
              your page.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
