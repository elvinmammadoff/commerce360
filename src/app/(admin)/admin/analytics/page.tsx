import type { Metadata } from "next";

import { AnalyticsView } from "@/components/admin/analytics-view";
import { PageHeader } from "@/components/shared/page-header";
import {
  getDailyRenders,
  getMonthlyRenders,
  getRevenueSeries,
  getUserGrowth,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin · Analytics",
};

export default async function AdminAnalyticsPage() {
  const [revenue, daily, monthly, growth] = await Promise.all([
    getRevenueSeries(),
    getDailyRenders(),
    getMonthlyRenders(),
    getUserGrowth(),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Growth over time — revenue, render throughput, credit sales, and the user base."
      />
      <AnalyticsView
        revenue={revenue}
        daily={daily}
        monthly={monthly}
        growth={growth}
      />
    </div>
  );
}
