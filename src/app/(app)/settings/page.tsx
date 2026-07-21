import type { Metadata } from "next";

import { SettingsView } from "@/components/app/settings/settings-view";
import { PageHeader } from "@/components/shared/page-header";
import {
  getCreditPacks,
  getNotificationPreferences,
  getPaymentMethod,
  getWorkspace,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const [workspace, paymentMethod, packs, notificationPrefs] = await Promise.all([
    getWorkspace(),
    getPaymentMethod(),
    getCreditPacks(),
    getNotificationPreferences(),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Profile, workspace, billing, and notification preferences."
      />
      <SettingsView
        workspace={workspace}
        paymentMethod={paymentMethod}
        packs={packs}
        notificationPrefs={notificationPrefs}
      />
    </div>
  );
}
