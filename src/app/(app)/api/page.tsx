import type { Metadata } from "next";

import { ApiView } from "@/components/app/api/api-view";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { getApiCodeSamples, getApiEndpoints, getApiKeys } from "@/lib/data";

export const metadata: Metadata = {
  title: "API",
};

export default async function ApiPage() {
  const [keys, endpoints] = await Promise.all([
    getApiKeys(),
    getApiEndpoints(),
  ]);
  const samples = getApiCodeSamples();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            API
            <Badge
              variant="outline"
              className="border-brand/25 bg-brand/10 font-mono text-[11px] text-brand"
            >
              v1
            </Badge>
          </span>
        }
        description="Render products programmatically — from your PIM, Shopify feed, or CI pipeline."
      />
      <ApiView keys={keys} endpoints={endpoints} samples={samples} />
    </div>
  );
}
