import type { Metadata } from "next";

import { OverviewView } from "@/components/admin/overview-view";
import { PageHeader } from "@/components/shared/page-header";
import {
  getAdminJobs,
  getAdminOrders,
  getAdminStats,
  getAdminUsers,
  getRevenueSeries,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin · Overview",
};

export default async function AdminOverviewPage() {
  const [stats, revenue, users, orders, jobs] = await Promise.all([
    getAdminStats(),
    getRevenueSeries(),
    getAdminUsers(),
    getAdminOrders(),
    getAdminJobs(),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Overview"
        description="Platform health at a glance — revenue, customers, credits, and the global render pipeline."
      />
      <OverviewView
        stats={stats}
        revenue={revenue}
        users={users}
        orders={orders}
        jobs={jobs}
      />
    </div>
  );
}
