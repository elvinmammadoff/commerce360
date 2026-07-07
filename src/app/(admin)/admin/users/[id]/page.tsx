import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserDetailView } from "@/components/admin/user-detail-view";
import { PageHeader } from "@/components/shared/page-header";
import {
  getAdminLedger,
  getAdminOrdersForCustomer,
  getAdminUser,
} from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await getAdminUser(id);
  return { title: user ? `Admin · ${user.company}` : "Admin · User" };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUser(id);
  if (!user) notFound();

  const [orders, ledger] = await Promise.all([
    getAdminOrdersForCustomer(user.company),
    getAdminLedger(user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title={user.company}
        description="Customer profile — wallet, purchase history, usage, and account controls."
      />
      <UserDetailView initial={user} orders={orders} ledger={ledger} />
    </div>
  );
}
