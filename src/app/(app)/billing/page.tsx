import type { Metadata } from "next";

import { BillingView } from "@/components/app/billing/billing-view";
import { PageHeader } from "@/components/shared/page-header";
import {
  getInvoices,
  getPaymentMethod,
  getPlans,
  getWorkspace,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const [workspace, plans, invoices, paymentMethod] = await Promise.all([
    getWorkspace(),
    getPlans(),
    getInvoices(),
    getPaymentMethod(),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Billing"
        description="Plan, payment method, and invoices for the Fernhaven Home workspace."
      />
      <BillingView
        workspace={workspace}
        plans={plans}
        invoices={invoices}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
