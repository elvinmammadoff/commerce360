import type { Metadata } from "next";

import { CreditsView } from "@/components/app/credits/credits-view";
import { PageHeader } from "@/components/shared/page-header";
import { getCreditLedger, getCreditPlans, getWorkspace } from "@/lib/data";

export const metadata: Metadata = {
  title: "Credits",
};

export default async function CreditsPage() {
  const [workspace, ledger, plans] = await Promise.all([
    getWorkspace(),
    getCreditLedger(),
    getCreditPlans(),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Credits"
        description="One credit renders one product into every output format. Credits never expire."
      />
      <CreditsView workspace={workspace} ledger={ledger} plans={plans} />
    </div>
  );
}
