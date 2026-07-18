"use client";

import * as React from "react";
import { Mail, Pause, TriangleAlert, UserPlus } from "lucide-react";
import { toast } from "sonner";

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
import type { TeamMember } from "@/lib/types";

function PlatformCard() {
  const [banner, setBanner] = React.useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform</CardTitle>
        <CardDescription>
          Global switches — changes apply to every workspace immediately
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between gap-4 pb-3">
            <div>
              <Label htmlFor="maintenance-mode" className="text-sm font-medium">
                Maintenance mode
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pauses new uploads and shows a status banner in the app
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              onCheckedChange={(checked) =>
                checked
                  ? toast.warning("Maintenance mode on", {
                      description: "New uploads are paused platform-wide.",
                    })
                  : toast.success("Maintenance mode off")
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <Label htmlFor="new-signups" className="text-sm font-medium">
                Accept new signups
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Turn off to waitlist new registrations
              </p>
            </div>
            <Switch
              id="new-signups"
              defaultChecked
              onCheckedChange={(checked) =>
                toast.success(`New signups ${checked ? "open" : "waitlisted"}`)
              }
            />
          </div>
          <div className="space-y-2 pt-3">
            <Label htmlFor="announcement">Announcement banner</Label>
            <Input
              id="announcement"
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="Shown at the top of every customer dashboard"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-border">
        <Button
          size="sm"
          onClick={() =>
            toast.success(
              banner.trim() ? "Announcement published" : "Announcement cleared",
            )
          }
        >
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function PipelineCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Render pipeline</CardTitle>
        <CardDescription>
          Defaults for the generation pipeline across all workspaces
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Default output resolution</Label>
            <Select defaultValue="4k">
              <SelectTrigger
                className="w-full"
                aria-label="Default output resolution"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4k">4K orbit video</SelectItem>
                <SelectItem value="1080p">1080p orbit video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-concurrent">
              Max concurrent renders per workspace
            </Label>
            <Input
              id="max-concurrent"
              type="number"
              min={1}
              max={20}
              defaultValue={3}
            />
          </div>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <Label htmlFor="auto-refund" className="text-sm font-medium">
                Auto-refund failed renders
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Credits return to the wallet the moment a job fails
              </p>
            </div>
            <Switch
              id="auto-refund"
              defaultChecked
              onCheckedChange={(checked) =>
                toast.success(`Auto-refund ${checked ? "on" : "off"}`)
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-3">
            <div>
              <Label htmlFor="priority-queue" className="text-sm font-medium">
                Priority queue for Factory packs
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Factory-pack customers skip ahead of the standard queue
              </p>
            </div>
            <Switch
              id="priority-queue"
              defaultChecked
              onCheckedChange={(checked) =>
                toast.success(`Priority queue ${checked ? "on" : "off"}`)
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-border">
        <Button size="sm" onClick={() => toast.success("Pipeline settings saved")}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function CreditsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credits</CardTitle>
        <CardDescription>
          Wallet defaults for the one-time credit model
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signup-bonus">Signup bonus credits</Label>
          <Input id="signup-bonus" type="number" min={0} defaultValue={1} />
          <p className="text-xs text-muted-foreground">
            Granted to every new workspace on day one
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="low-balance">Low-balance alert threshold</Label>
          <Input id="low-balance" type="number" min={0} defaultValue={5} />
          <p className="text-xs text-muted-foreground">
            Customers get a top-up nudge below this balance
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-border">
        <Button size="sm" onClick={() => toast.success("Credit settings saved")}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

const ADMIN_ALERTS = [
  {
    id: "alert-payment-failed",
    label: "Failed payments",
    description: "Immediate alert when a Stripe charge is declined",
    defaultOn: true,
  },
  {
    id: "alert-failure-spike",
    label: "Render failure spike",
    description: "Failure rate above 2% over a rolling hour",
    defaultOn: true,
  },
  {
    id: "alert-queue-depth",
    label: "Queue depth",
    description: "More than 40 jobs pending platform-wide",
    defaultOn: true,
  },
  {
    id: "alert-weekly-digest",
    label: "Weekly ops digest",
    description: "Revenue, renders, and signups, every Monday",
    defaultOn: false,
  },
];

function AlertsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin alerts</CardTitle>
        <CardDescription>Delivered to the ops channel and email</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {ADMIN_ALERTS.map((pref) => (
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
                toast.success(`${pref.label} alerts ${checked ? "on" : "off"}`)
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InviteStaffDialog() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const invite = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setOpen(false);
    setEmail("");
    toast.success("Invite sent", { description: `${email} · admin role` });
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
          <DialogTitle>Invite staff</DialogTitle>
          <DialogDescription>
            Staff get full access to the admin console. Customers can never be
            granted admin access from here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="staff-email">Work email</Label>
          <Input
            id="staff-email"
            type="email"
            placeholder="teammate@commerce360.ai"
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

function StaffCard({ staff }: { staff: TeamMember[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Staff access</CardTitle>
          <CardDescription>
            Orbittify team members with admin-console access
          </CardDescription>
        </div>
        <InviteStaffDialog />
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
              {staff.map((member) => (
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
                    <Select
                      defaultValue={member.role}
                      onValueChange={(role) =>
                        toast.success("Role updated", {
                          description: `${member.name} is now ${role}.`,
                        })
                      }
                    >
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
                        <SelectItem value="member">Analyst</SelectItem>
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

function DangerZoneCard() {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlert className="size-4" aria-hidden="true" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Pausing the pipeline stops all rendering for every customer. Queued
          jobs are held, not cancelled.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Pause aria-hidden="true" /> Pause all rendering
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Pause the entire pipeline?</AlertDialogTitle>
              <AlertDialogDescription>
                All GPU workers stop taking jobs. 47 pending jobs stay in the
                queue and resume automatically when the pipeline is unpaused.
                Customers see a status banner.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() =>
                  toast.warning("Pipeline paused", {
                    description:
                      "Rendering is stopped platform-wide. Unpause from this page.",
                  })
                }
              >
                Pause rendering
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export function AdminSettingsView({ staff }: { staff: TeamMember[] }) {
  return (
    <div className="space-y-6">
      <PlatformCard />
      <PipelineCard />
      <CreditsCard />
      <AlertsCard />
      <StaffCard staff={staff} />
      <DangerZoneCard />
    </div>
  );
}
