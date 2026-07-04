import type { Metadata } from "next";

import { HistoryTable } from "@/components/app/history/history-table";
import { PageHeader } from "@/components/shared/page-header";
import { getJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: "History",
};

export default async function HistoryPage() {
  const jobs = await getJobs();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Render history"
        description="Every job that has run through the pipeline, including re-renders and refunds."
      />
      <HistoryTable initial={jobs} />
    </div>
  );
}
