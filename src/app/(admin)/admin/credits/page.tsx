import type { Metadata } from "next";

import { CreditsView } from "@/components/admin/credits-view";
import { PageHeader } from "@/components/shared/page-header";
import {
  getAdminAdjustments,
  getAdminStats,
  getAdminUsers,
  getDailyRenders,
  getRevenueSeries,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin · Credits",
};

export default async function AdminCreditsPage() {
  const [stats, revenue, usage, adjustments, users] = await Promise.all([
    getAdminStats(),
    getRevenueSeries(),
    getDailyRenders(),
    getAdminAdjustments(),
    getAdminUsers(),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Credits"
        description="The credit economy — packs sold, credits consumed by renders, and manual staff adjustments."
      />
      <CreditsView
        stats={stats}
        revenue={revenue}
        usage={usage}
        adjustments={adjustments}
        users={users}
      />
    </div>
  );
}
