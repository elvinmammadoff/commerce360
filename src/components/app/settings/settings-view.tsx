"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, Receipt, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { BuyCreditsDialog } from "@/components/app/credits/buy-credits-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/lib/user-context";
import type { CreditPack, PaymentMethod, Workspace } from "@/lib/types";

function ProfileCard() {
  const { user, updateUser } = useUser();
  const [name, setName] = React.useState(user.name);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const save = () => {
    updateUser({ name: name.trim() });
    toast.success("Profile saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How you appear across the workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
            <AvatarFallback className="bg-secondary text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
        </div>
        <div className="max-w-sm space-y-2">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-border">
        <Button size="sm" onClick={save} disabled={name.trim().length < 2}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const [name, setName] = React.useState(workspace.name);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>Shown on receipts and invoices</CardDescription>
      </CardHeader>
      <CardContent className="max-w-sm space-y-2">
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input
          id="ws-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </CardContent>
      <CardFooter className="justify-end border-t border-border">
        <Button size="sm" onClick={() => toast.success("Workspace updated")}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

const NOTIFICATION_PREFS = [
  {
    id: "render-complete",
    label: "Render completed",
    description: "Email + in-app when a product finishes rendering",
    defaultOn: true,
  },
  {
    id: "render-failed",
    label: "Render failed",
    description: "Immediate alert with the failure reason and refund note",
    defaultOn: true,
  },
  {
    id: "weekly-digest",
    label: "Weekly digest",
    description: "Credit usage summary, every Monday",
    defaultOn: true,
  },
  {
    id: "product-news",
    label: "Product updates",
    description: "New pipeline models and marketplace formats",
    defaultOn: false,
  },
];

function NotificationsCard() {
  const { user } = useUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Delivered to {user.email}</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {NOTIFICATION_PREFS.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <Label htmlFor={pref.id} className="text-sm font-medium">
                {pref.label}
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {pref.description}
              </p>
            </div>
            <Switch
              id={pref.id}
              defaultChecked={pref.defaultOn}
              onCheckedChange={(checked) =>
                toast.success(
                  `${pref.label} notifications ${checked ? "on" : "off"}`,
                )
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BillingCard({
  paymentMethod,
  packs,
}: {
  paymentMethod: PaymentMethod | null;
  packs: CreditPack[];
}) {
  return (
    <Card id="billing">
      <CardHeader>
        <CardTitle>Billing &amp; credits</CardTitle>
        <CardDescription>One-time credit purchases · no subscription</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border bg-card">
              <CreditCard className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Payment method</p>
              <p className="text-xs text-muted-foreground capitalize">
                {paymentMethod
                  ? `${paymentMethod.brand} ·· ${paymentMethod.last4} · expires ${String(paymentMethod.expMonth).padStart(2, "0")}/${paymentMethod.expYear}`
                  : "No card on file"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.info("Card update", {
                description: "A secure Stripe portal session opens here in production.",
              })
            }
          >
            Update card
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t border-border">
        <Button asChild variant="ghost" size="sm">
          <Link href="/billing">
            <Receipt aria-hidden="true" /> Billing history
          </Link>
        </Button>
        <BuyCreditsDialog packs={packs} />
      </CardFooter>
    </Card>
  );
}

function DangerZoneCard({ workspace }: { workspace: Workspace }) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlert className="size-4" aria-hidden="true" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Deleting the workspace removes all products, renders, and share pages.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete workspace
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {workspace.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes all products, generated assets, and
                every live share page. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() =>
                  toast.info("Workspace deletion requires owner email confirmation")
                }
              >
                Delete workspace
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export function SettingsView({
  workspace,
  paymentMethod,
  packs,
}: {
  workspace: Workspace;
  paymentMethod: PaymentMethod | null;
  packs: CreditPack[];
}) {
  return (
    <div className="space-y-6">
      <ProfileCard />
      <WorkspaceCard workspace={workspace} />
      <BillingCard paymentMethod={paymentMethod} packs={packs} />
      <NotificationsCard />
      <DangerZoneCard workspace={workspace} />
    </div>
  );
}
