import type { Metadata } from "next";
import { Coins } from "lucide-react";

import { ActiveRenders } from "@/components/app/dashboard/active-renders";
import { ActivityFeed } from "@/components/app/dashboard/activity-feed";
import { BuyCreditsDialog } from "@/components/app/credits/buy-credits-dialog";
import { EngagementChart } from "@/components/app/dashboard/engagement-chart";
import { RecentProducts } from "@/components/app/dashboard/recent-products";
import { StatCards } from "@/components/app/dashboard/stat-cards";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  getActiveJobs,
  getCreditPacks,
  getEngagementSeries,
  getProducts,
  getWorkspace,
} from "@/lib/data";
import type { ActivityEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [workspace, products, activeJobs, engagement, packs] =
    await Promise.all([
      getWorkspace(),
      getProducts(),
      getActiveJobs(),
      getEngagementSeries(),
      getCreditPacks(),
    ]);

  const activity: ActivityEvent[] = products
    .flatMap((p): ActivityEvent[] => {
      if (p.status === "completed" && p.completedAt) {
        return [{
          id: `completed-${p.id}`,
          type: "generation_completed",
          message: `${p.name} orbit render completed`,
          actor: "System",
          createdAt: p.completedAt,
          href: `/products/${p.id}`,
        }];
      }
      if (p.status === "failed") {
        return [{
          id: `failed-${p.id}`,
          type: "generation_failed",
          message: `${p.name} render failed`,
          actor: "System",
          createdAt: p.createdAt,
          href: `/products/${p.id}`,
        }];
      }
      if (p.status === "queued" || p.status === "processing") {
        return [{
          id: `started-${p.id}`,
          type: "generation_started",
          message: `${p.name} render started`,
          actor: "System",
          createdAt: p.createdAt,
          href: `/products/${p.id}`,
        }];
      }
      return [];
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`What's happening across ${workspace.name}.`}
        actions={
          <BuyCreditsDialog
            packs={packs}
            trigger={
              <Button size="sm">
                <Coins aria-hidden="true" /> Buy credits
              </Button>
            }
          />
        }
      />
      <StatCards products={products} workspace={workspace} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <EngagementChart data={engagement} />
          <ActiveRenders initialJobs={activeJobs} />
        </div>
        <div className="flex flex-col gap-6">
          <RecentProducts initial={products} />
          <ActivityFeed events={activity} />
        </div>
      </div>
    </div>
  );
}
