import type { Metadata } from "next";

import { AdminSettingsView } from "@/components/admin/admin-settings-view";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminStaff } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin · Settings",
};

export default async function AdminSettingsPage() {
  const staff = await getAdminStaff();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Admin settings"
        description="Platform switches, pipeline defaults, credit policy, alerts, and staff access."
      />
      <AdminSettingsView staff={staff} />
    </div>
  );
}
