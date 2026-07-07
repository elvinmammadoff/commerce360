import type { Metadata } from "next";

import { UsersView } from "@/components/admin/users-view";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminUsers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin · Users",
};

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Users"
        description="Every customer account — credit wallets, purchase activity, and account controls."
      />
      <UsersView initial={users} />
    </div>
  );
}
