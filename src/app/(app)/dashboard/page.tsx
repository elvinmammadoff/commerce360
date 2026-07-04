import type { Metadata } from "next";

import { ActiveRenders } from "@/components/app/dashboard/active-renders";
import { ActivityFeed } from "@/components/app/dashboard/activity-feed";
import { EngagementChart } from "@/components/app/dashboard/engagement-chart";
import { RecentProducts } from "@/components/app/dashboard/recent-products";
import { StatCards } from "@/components/app/dashboard/stat-cards";
import { PageHeader } from "@/components/shared/page-header";
import {
  getActiveJobs,
  getActivity,
  getEngagementSeries,
  getJobs,
  getProducts,
  getWorkspace,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [workspace, products, jobs, activeJobs, activity, engagement] =
    await Promise.all([
      getWorkspace(),
      getProducts(),
      getJobs(),
      getActiveJobs(),
      getActivity(),
      getEngagementSeries(),
    ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`What's happening across ${workspace.name}.`}
      />
      <StatCards products={products} jobs={jobs} workspace={workspace} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <EngagementChart data={engagement} />
          <ActiveRenders initialJobs={activeJobs} />
        </div>
        <div className="flex flex-col gap-6">
          <RecentProducts initial={products} />
          <ActivityFeed events={activity.slice(0, 6)} />
        </div>
      </div>
    </div>
  );
}
