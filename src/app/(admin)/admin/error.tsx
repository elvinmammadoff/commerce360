"use client";

import * as React from "react";
import { RefreshCcw, TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl py-16">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description="The admin console hit an unexpected error. Platform data is unaffected."
        action={
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCcw aria-hidden="true" /> Try again
          </Button>
        }
      />
    </div>
  );
}
