"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, Loader2, Receipt, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { BuyCreditsDialog } from "@/components/app/credits/buy-credits-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { deleteWorkspace } from "@/lib/auth-actions";
import {
  updateNotificationPreferences,
  updateProfile,
  updateWorkspaceName,
} from "@/lib/settings-actions";
import { useUser } from "@/lib/user-context";
import type { CreditPack, NotificationPreferences, PaymentMethod, Workspace } from "@/lib/types";

function ProfileCard() {
  const { user, updateUser } = useUser();
  const [name, setName] = React.useState(user.name);
  const [pending, startTransition] = React.useTransition();

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const save = () => {
    const trimmed = name.trim();
    startTransition(async () => {
      const result = await updateProfile(trimmed);
      if (result?.error) {
        toast.error(result.error);
      } else {
        updateUser({ name: trimmed });
        toast.success("Profile saved");
      }
    });
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
        <Button size="sm" onClick={save} disabled={name.trim().length < 2 || pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const [name, setName] = React.useState(workspace.name);
  const [pending, startTransition] = React.useTransition();

  const save = () => {
    const trimmed = name.trim();
    startTransition(async () => {
      const result = await updateWorkspaceName(trimmed);
      if (result?.error) {
        toast.error(result.error);
        setName(workspace.name);
      } else {
        toast.success("Workspace updated");
      }
    });
  };

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
        <Button size="sm" onClick={save} disabled={name.trim().length < 1 || pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

const PREF_ROWS: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: "renderComplete",
    label: "Render completed",
    description: "Email + in-app when a product finishes rendering",
  },
  {
    key: "renderFailed",
    label: "Render failed",
    description: "Immediate alert with the failure reason and refund note",
  },
  {
    key: "weeklyDigest",
    label: "Weekly digest",
    description: "Credit usage summary, every Monday",
  },
  {
    key: "productNews",
    label: "Product updates",
    description: "New pipeline models and marketplace formats",
  },
];

function NotificationsCard({ prefs }: { prefs: NotificationPreferences }) {
  const { user } = useUser();
  const [values, setValues] = React.useState<NotificationPreferences>(prefs);

  const handleChange = async (key: keyof NotificationPreferences, checked: boolean) => {
    setValues((prev) => ({ ...prev, [key]: checked }));
    const result = await updateNotificationPreferences({ [key]: checked });
    if (result?.error) {
      setValues((prev) => ({ ...prev, [key]: !checked }));
      toast.error(result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Delivered to {user.email}</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {PREF_ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <Label htmlFor={row.key} className="text-sm font-medium">
                {row.label}
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {row.description}
              </p>
            </div>
            <Switch
              id={row.key}
              checked={values[row.key]}
              onCheckedChange={(checked) => void handleChange(row.key, checked)}
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
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const canDelete = confirm === workspace.name;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWorkspace();
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

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
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setConfirm("");
          }}
        >
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete workspace
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete workspace</DialogTitle>
              <DialogDescription>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">{workspace.name}</span>{" "}
                and all its products, generated assets, and share pages.
                This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="delete-confirm" className="text-sm">
                To confirm, type{" "}
                <span className="font-semibold text-foreground">
                  {workspace.name}
                </span>
              </Label>
              <Input
                id="delete-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={workspace.name}
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!canDelete || pending}
                onClick={handleDelete}
              >
                {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Delete workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

export function SettingsView({
  workspace,
  paymentMethod,
  packs,
  notificationPrefs,
}: {
  workspace: Workspace;
  paymentMethod: PaymentMethod | null;
  packs: CreditPack[];
  notificationPrefs: NotificationPreferences;
}) {
  return (
    <div className="space-y-6">
      <ProfileCard />
      <WorkspaceCard workspace={workspace} />
      <BillingCard paymentMethod={paymentMethod} packs={packs} />
      <NotificationsCard prefs={notificationPrefs} />
      <DangerZoneCard workspace={workspace} />
    </div>
  );
}
