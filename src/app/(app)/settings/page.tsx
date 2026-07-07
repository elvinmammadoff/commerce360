import type { Metadata } from "next";

import { SettingsView } from "@/components/app/settings/settings-view";
import { PageHeader } from "@/components/shared/page-header";
import {
  getCreditPacks,
  getCurrentUser,
  getPaymentMethod,
  getTeamMembers,
  getWorkspace,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const [user, workspace, members, paymentMethod, packs] = await Promise.all([
    getCurrentUser(),
    getWorkspace(),
    getTeamMembers(),
    getPaymentMethod(),
    getCreditPacks(),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Profile, workspace, billing, team, and notification preferences."
      />
      <SettingsView
        user={user}
        workspace={workspace}
        members={members}
        paymentMethod={paymentMethod}
        packs={packs}
      />
    </div>
  );
}
