import type { Metadata } from "next";

import { JobsView } from "@/components/admin/jobs-view";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminJobs, getAdminStats, getDailyRenders } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin · Jobs",
};

export default async function AdminJobsPage() {
  const [stats, jobs, daily] = await Promise.all([
    getAdminStats(),
    getAdminJobs(),
    getDailyRenders(),
  ]);
  const completedToday = daily[daily.length - 1]?.renders ?? 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Jobs"
        description="The global render pipeline — queued, processing, completed, and failed jobs across every workspace."
      />
      <JobsView stats={stats} completedToday={completedToday} initial={jobs} />
    </div>
  );
}
