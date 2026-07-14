"use server";

// Requires the Node.js runtime for DNS MX resolution (node:dns). Runtime is
// inherited from the calling route segment, which is pinned in
// src/app/(marketing)/page.tsx via `export const runtime = "nodejs"`.

import { headers } from "next/headers";

import { submitWaitlist } from "@/lib/waitlist";

function getClientIp(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerList.get("x-real-ip")?.trim() || "unknown";
}

export async function joinWaitlist(
  email: string,
  honeypot: string = "",
): Promise<{ error: string | null }> {
  const headerList = await headers();
  const ip = getClientIp(headerList);

  return submitWaitlist({ email, honeypot, ip });
}
