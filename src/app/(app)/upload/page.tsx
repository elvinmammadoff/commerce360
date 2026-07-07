import type { Metadata } from "next";

import { UploadFlow } from "@/components/app/upload/upload-flow";
import { PageHeader } from "@/components/shared/page-header";
import { getProduct } from "@/lib/data";

export const metadata: Metadata = {
  title: "Upload",
};

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ retry?: string; draft?: string }>;
}) {
  const { retry, draft } = await searchParams;
  const prefillId = retry ?? draft;
  const prefill = prefillId ? await getProduct(prefillId) : undefined;

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col gap-6">
      <PageHeader
        title="New product"
        description="Upload one photo — we generate the 360° viewer, orbit video, 72 frames, and marketplace set."
      />
      <UploadFlow prefill={prefill} />
    </div>
  );
}
