import type { Metadata } from "next";

import { BillingView } from "@/components/app/billing/billing-view";
import { PageHeader } from "@/components/shared/page-header";
import {
  getCreditPacks,
  getPaymentMethod,
  getPurchases,
  getWorkspace,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const [workspace, packs, purchases, paymentMethod] = await Promise.all([
    getWorkspace(),
    getCreditPacks(),
    getPurchases(),
    getPaymentMethod(),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Billing"
        description="Credit wallet, payment method, and purchase history for the Fernhaven Home workspace."
      />
      <BillingView
        workspace={workspace}
        packs={packs}
        purchases={purchases}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
