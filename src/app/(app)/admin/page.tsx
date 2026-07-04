import type { Metadata } from "next";

import { AdminView } from "@/components/app/admin/admin-view";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  getAdminJobs,
  getAdminStats,
  getAdminWorkspaces,
  getRevenueSeries,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const [stats, revenue, workspaces, jobs] = await Promise.all([
    getAdminStats(),
    getRevenueSeries(),
    getAdminWorkspaces(),
    getAdminJobs(),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            Platform admin
            <Badge
              variant="outline"
              className="border-warning/25 bg-warning/10 text-warning"
            >
              Internal
            </Badge>
          </span>
        }
        description="Operations view for Commerce360 staff — revenue, workspaces, and the global render queue."
      />
      <AdminView
        stats={stats}
        revenue={revenue}
        workspaces={workspaces}
        jobs={jobs}
      />
    </div>
  );
}
