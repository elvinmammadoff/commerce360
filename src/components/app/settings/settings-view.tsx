"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  Mail,
  Receipt,
  TriangleAlert,
  UserPlus,
} from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type {
  CreditPack,
  CurrentUser,
  PaymentMethod,
  TeamMember,
  Workspace,
} from "@/lib/types";

function ProfileCard({ user }: { user: CurrentUser }) {
  const [name, setName] = React.useState(user.name);
  const [title, setTitle] = React.useState(user.title);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How you appear across the workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-secondary text-lg font-medium">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Single sign-on arrives with the Phase 2 backend
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-title">Title</Label>
            <Input
              id="profile-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-border">
        <Button
          size="sm"
          onClick={() => toast.success("Profile saved")}
          disabled={name.trim().length < 2}
        >
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
        <CardDescription>
          Shown on share pages and receipts
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ws-slug">Share URL</Label>
          <div className="flex items-center gap-0">
            <span className="flex h-8 items-center rounded-l-lg border border-r-0 border-input bg-muted px-2.5 font-mono text-xs text-muted-foreground">
              share.commerce360.ai/
            </span>
            <Input
              id="ws-slug"
              defaultValue={workspace.slug}
              className="rounded-l-none font-mono"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-border">
        <Button size="sm" onClick={() => toast.success("Workspace updated")}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function InviteDialog() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const invite = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setOpen(false);
    setEmail("");
    toast.success("Invite sent", { description: `${email} · member role` });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus aria-hidden="true" /> Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            Teammates share the workspace credit wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="invite-email">Work email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="teammate@fernhaven.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && invite()}
          />
        </div>
        <DialogFooter>
          <Button type="button" className="w-full" onClick={invite}>
            <Mail aria-hidden="true" /> Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamCard({ members }: { members: TeamMember[] }) {
  return (
    <Card id="team">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Team</CardTitle>
          <CardDescription>
            {members.filter((m) => m.status === "active").length} active ·{" "}
            {members.filter((m) => m.status === "invited").length} pending invite
          </CardDescription>
        </div>
        <InviteDialog />
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>Member</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-secondary text-xs font-medium">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          {member.name}
                          {member.status === "invited" && (
                            <Badge
                              variant="outline"
                              className="border-warning/25 bg-warning/10 text-warning"
                            >
                              Invited
                            </Badge>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Select defaultValue={member.role}>
                      <SelectTrigger
                        size="sm"
                        className="w-28"
                        aria-label={`Role for ${member.name}`}
                        disabled={member.role === "owner"}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden text-right text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                    {member.joinedAt ? formatDate(member.joinedAt) : "—"}
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
    description: "Viewer engagement and credit usage, every Monday",
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Delivered to maya@fernhaven.com</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {NOTIFICATION_PREFS.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
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
  paymentMethod: PaymentMethod;
  packs: CreditPack[];
}) {
  return (
    <Card id="billing">
      <CardHeader>
        <CardTitle>Billing &amp; credits</CardTitle>
        <CardDescription>
          One-time credit purchases · no subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border bg-card">
              <CreditCard
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Payment method</p>
              <p className="text-xs text-muted-foreground capitalize">
                {paymentMethod.brand} ·· {paymentMethod.last4} · expires{" "}
                {String(paymentMethod.expMonth).padStart(2, "0")}/
                {paymentMethod.expYear}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.info("Card update", {
                description:
                  "A secure Stripe portal session opens here in production.",
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

function DangerZoneCard() {
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
              <AlertDialogTitle>Delete Fernhaven Home?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes 8 products, all generated assets, and
                every live share page. Embedded viewers on fernhaven.com will
                stop working. This cannot be undone.
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
  user,
  workspace,
  members,
  paymentMethod,
  packs,
}: {
  user: CurrentUser;
  workspace: Workspace;
  members: TeamMember[];
  paymentMethod: PaymentMethod;
  packs: CreditPack[];
}) {
  return (
    <div className="space-y-6">
      <ProfileCard user={user} />
      <WorkspaceCard workspace={workspace} />
      <BillingCard paymentMethod={paymentMethod} packs={packs} />
      <TeamCard members={members} />
      <NotificationsCard />
      <DangerZoneCard />
    </div>
  );
}
