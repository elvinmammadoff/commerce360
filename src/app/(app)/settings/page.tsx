import type { Metadata } from "next";

import { SettingsView } from "@/components/app/settings/settings-view";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser, getTeamMembers, getWorkspace } from "@/lib/data";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const [user, workspace, members] = await Promise.all([
    getCurrentUser(),
    getWorkspace(),
    getTeamMembers(),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Profile, workspace, team, and notification preferences."
      />
      <SettingsView user={user} workspace={workspace} members={members} />
    </div>
  );
}
