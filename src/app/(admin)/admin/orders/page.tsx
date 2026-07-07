import type { Metadata } from "next";

import { OrdersView } from "@/components/admin/orders-view";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminOrders } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin · Orders",
};

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Orders"
        description="One-time Stripe payments across the platform — statuses, refunds, and purchase history."
      />
      <OrdersView initial={orders} />
    </div>
  );
}
