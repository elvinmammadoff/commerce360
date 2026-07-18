"use client";

import * as React from "react";
import { KeyRound, Plus, ShieldAlert, Webhook } from "lucide-react";
import { toast } from "sonner";

import { CopyButton } from "@/components/shared/copy-button";
import { RelativeTime } from "@/components/shared/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ApiEndpoint, ApiKey } from "@/lib/types";

const METHOD_STYLE: Record<ApiEndpoint["method"], string> = {
  GET: "border-success/25 bg-success/10 text-success",
  POST: "border-brand/25 bg-brand/10 text-brand",
  DELETE: "border-destructive/25 bg-destructive/10 text-destructive",
};

function CreateKeyDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [createdKey, setCreatedKey] = React.useState<string | null>(null);

  const create = () => {
    if (name.trim().length < 2) {
      toast.error("Give the key a name");
      return;
    }
    const random = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setCreatedKey(`c360_live_${random}`);
  };

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setName("");
      setCreatedKey(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" /> Create key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {createdKey === null ? (
          <>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>
                Keys inherit workspace permissions. Rotate them any time.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Shopify integration"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
              />
            </div>
            <DialogFooter>
              <Button type="button" className="w-full" onClick={create}>
                Generate key
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>“{name.trim()}” created</DialogTitle>
              <DialogDescription>
                Copy it now — for security we only show it once.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs">
                {createdKey}
              </code>
              <CopyButton value={createdKey} label="API key" />
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning/10 p-3">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">
                Store it in a secret manager. Anyone with this key can spend
                workspace credits.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => close(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function KeysCard({ keys }: { keys: ApiKey[] }) {
  const [rows, setRows] = React.useState(keys);

  const revoke = (id: string) => {
    setRows((prev) =>
      prev.map((key) =>
        key.id === id ? { ...key, status: "revoked" as const } : key,
      ),
    );
    toast.success("Key revoked", {
      description: "Requests using it now return 401.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>API keys</CardTitle>
          <CardDescription>
            {formatNumber(
              rows.reduce((sum, k) => sum + k.requestsThisMonth, 0),
            )}{" "}
            requests this month across {rows.filter((k) => k.status === "active").length}{" "}
            active keys
          </CardDescription>
        </div>
        <CreateKeyDialog />
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>Key</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="hidden sm:table-cell">Last used</TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Requests
                </TableHead>
                <TableHead className="w-24 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                        <KeyRound className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{key.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {key.maskedKey}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                    <RelativeTime iso={key.createdAt} />
                  </TableCell>
                  <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                    {key.lastUsedAt ? <RelativeTime iso={key.lastUsedAt} /> : "Never"}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-sm tabular-nums lg:table-cell">
                    {formatNumber(key.requestsThisMonth)}
                  </TableCell>
                  <TableCell className="text-right">
                    {key.status === "active" ? (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => revoke(key.id)}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Revoked
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function EndpointsCard({ endpoints }: { endpoints: ApiEndpoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Endpoints</CardTitle>
        <CardDescription>
          REST over HTTPS · base URL{" "}
          <code className="font-mono text-xs">https://api.orbittify.com</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {endpoints.map((endpoint) => (
          <div
            key={`${endpoint.method}-${endpoint.path}`}
            className="rounded-xl border border-border bg-background/40 p-4"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge
                variant="outline"
                className={cn("font-mono text-[11px]", METHOD_STYLE[endpoint.method])}
              >
                {endpoint.method}
              </Badge>
              <code className="font-mono text-sm text-foreground">
                {endpoint.path}
              </code>
              <span className="text-sm text-muted-foreground">
                — {endpoint.summary}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {endpoint.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickstartCard({
  samples,
}: {
  samples: { curl: string; node: string; python: string };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quickstart</CardTitle>
        <CardDescription>
          Create a product from a photo and wait for the render
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curl">
          <TabsList>
            <TabsTrigger value="curl">curl</TabsTrigger>
            <TabsTrigger value="node">Node.js</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>
          {(Object.entries(samples) as [string, string][]).map(([lang, code]) => (
            <TabsContent key={lang} value={lang} className="relative mt-3">
              <pre className="overflow-x-auto rounded-xl border border-border bg-[#0b0b0b] p-4 font-mono text-xs leading-relaxed text-foreground/90">
                <code>{code}</code>
              </pre>
              <div className="absolute top-2.5 right-2.5">
                <CopyButton value={code} label="Code sample" size="icon-xs" />
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-card/60 p-4">
          <Webhook className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Prefer push over polling? Register a{" "}
            <code className="font-mono text-xs">job.completed</code> webhook and
            we&apos;ll POST the asset URLs the moment packaging finishes. Rate
            limits: 120 requests/min, 20 concurrent renders on Scale.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApiView({
  keys,
  endpoints,
  samples,
}: {
  keys: ApiKey[];
  endpoints: ApiEndpoint[];
  samples: { curl: string; node: string; python: string };
}) {
  return (
    <div className="space-y-6">
      <KeysCard keys={keys} />
      <QuickstartCard samples={samples} />
      <EndpointsCard endpoints={endpoints} />
    </div>
  );
}
