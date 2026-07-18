"use client";

import * as React from "react";
import { Download, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { embedUrl, shareUrl, widgetSrc } from "@/lib/share";
import type { Product } from "@/lib/types";

export function ShareDialog({ product }: { product: Product }) {
  const slug = product.shareSlug ?? product.id;
  const link = shareUrl(slug);
  const embed = embedUrl(slug);
  const sku = product.sku || slug;

  const qrRef = React.useRef<HTMLDivElement>(null);

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-qr.png`;
    a.click();
  };

  // Recommended: one script tag, auto-matches products by SKU. Responsive,
  // no fixed dimensions, no iframe CSP headaches.
  const scriptCode = `<script
  src="${widgetSrc()}"
  data-key="YOUR_API_KEY"
  data-sku="${sku}"
  defer
></script>`;

  // Fallback for platforms that block inline scripts.
  const iframeCode = `<iframe
  src="${embed}"
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
            The hosted viewer works anywhere — no account needed to view.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-url">Share link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                readOnly
                value={link}
                className="font-mono text-xs"
                onFocus={(e) => e.currentTarget.select()}
              />
              <CopyButton value={link} label="Link" />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div ref={qrRef} className="shrink-0 rounded-md bg-white p-1.5">
              <QRCodeCanvas value={link} size={72} marginSize={0} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Showroom QR</p>
              <p className="text-xs text-muted-foreground">
                Print it in-store — shoppers scan to spin the product on their
                phone.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadQr}
              className="shrink-0"
            >
              <Download aria-hidden="true" /> PNG
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Embed on your product page</Label>
            <Tabs defaultValue="script">
              <TabsList className="w-full">
                <TabsTrigger value="script" className="flex-1">
                  Script
                  <span className="ml-1.5 rounded bg-brand/15 px-1 py-px text-[10px] font-medium text-brand">
                    Recommended
                  </span>
                </TabsTrigger>
                <TabsTrigger value="iframe" className="flex-1">
                  iframe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="script" className="space-y-2">
                <div className="flex items-start gap-2">
                  <Textarea
                    readOnly
                    value={scriptCode}
                    rows={6}
                    className="resize-none font-mono text-xs leading-relaxed"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <CopyButton value={scriptCode} label="Script" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste once per store. It auto-matches products by{" "}
                  <code className="font-mono">data-sku</code> and resizes to its
                  container. Replace{" "}
                  <code className="font-mono">YOUR_API_KEY</code> with a key from{" "}
                  <span className="text-foreground">Settings → API</span>.
                </p>
              </TabsContent>

              <TabsContent value="iframe" className="space-y-2">
                <div className="flex items-start gap-2">
                  <Textarea
                    readOnly
                    value={iframeCode}
                    rows={7}
                    className="resize-none font-mono text-xs leading-relaxed"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <CopyButton value={iframeCode} label="Embed code" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Fixed-size fallback — use when inline scripts are blocked.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
