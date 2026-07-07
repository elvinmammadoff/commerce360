"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Eye, MoreHorizontal, Search, UserCheck, Users } from "lucide-react";

import { UserStatusBadge } from "@/components/admin/admin-badges";
import { AdjustCreditsDialog } from "@/components/admin/adjust-credits-dialog";
import { SuspendAccountDialog } from "@/components/admin/suspend-account-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import type { AdminUserRow, AdminUserStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: AdminUserStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

function UserActions({
  user,
  onAdjust,
  onToggleSuspend,
}: {
  user: AdminUserRow;
  onAdjust: (delta: number) => void;
  onToggleSuspend: () => void;
}) {
  const router = useRouter();
  const [suspendOpen, setSuspendOpen] = React.useState(false);
  const suspended = user.status === "suspended";

  return (
    <div className="flex items-center justify-end gap-1.5">
      <AdjustCreditsDialog
        company={user.company}
        balance={user.creditBalance}
        onAdjust={onAdjust}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${user.company}`}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onSelect={() => router.push(`/admin/users/${user.id}`)}
          >
            <Eye aria-hidden="true" /> View profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={suspended ? "default" : "destructive"}
            onSelect={() => setSuspendOpen(true)}
          >
            {suspended ? (
              <>
                <UserCheck aria-hidden="true" /> Reactivate account
              </>
            ) : (
              <>
                <Ban aria-hidden="true" /> Suspend account
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SuspendAccountDialog
        company={user.company}
        suspended={suspended}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        onConfirm={onToggleSuspend}
      />
    </div>
  );
}

export function UsersView({ initial }: { initial: AdminUserRow[] }) {
  const [users, setUsers] = React.useState(initial);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<AdminUserStatus | "all">("all");

  const filtered = users.filter((user) => {
    const matchesQuery =
      query.trim() === "" ||
      `${user.company} ${user.name} ${user.email}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesStatus = status === "all" || user.status === status;
    return matchesQuery && matchesStatus;
  });

  const adjustBalance = (id: string, delta: number) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              creditBalance: u.creditBalance + delta,
              creditsPurchased:
                delta > 0 ? u.creditsPurchased + delta : u.creditsPurchased,
            }
          : u,
      ),
    );

  const toggleSuspend = (id: string) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "suspended" ? "active" : "suspended" }
          : u,
      ),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} accounts shown ·{" "}
          {users.filter((u) => u.status === "active").length} active ·{" "}
          {users.filter((u) => u.status === "suspended").length} suspended
        </p>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company, name, or email…"
              className="w-full pl-8 sm:w-72"
              aria-label="Search users"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as AdminUserStatus | "all")}
          >
            <SelectTrigger className="w-36" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match"
          description="Try a different search or clear the status filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Purchased
                </TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Used
                </TableHead>
                <TableHead className="hidden text-right xl:table-cell">
                  Joined
                </TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Status
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {user.company}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {user.name} · {user.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {formatNumber(user.creditBalance)}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-sm tabular-nums md:table-cell">
                    {formatNumber(user.creditsPurchased)}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-sm tabular-nums lg:table-cell">
                    {formatNumber(user.creditsUsed)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm whitespace-nowrap text-muted-foreground xl:table-cell">
                    {formatDate(user.joinedAt)}
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions
                      user={user}
                      onAdjust={(delta) => adjustBalance(user.id, delta)}
                      onToggleSuspend={() => toggleSuspend(user.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
