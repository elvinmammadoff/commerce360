import { createHash } from "node:crypto";

import { getSupabaseClient } from "@/lib/supabase";

export type RateLimitResult = "ok" | "hourly" | "cooldown";

/**
 * Hash the client IP with a server-side salt so raw addresses never touch the
 * database. Without a salt a SHA of an IPv4 is trivially reversible (~4B keys),
 * so WAITLIST_IP_SALT should be set in production; the fallback keeps dev working.
 */
function hashIp(ip: string): string {
  const salt = process.env.WAITLIST_IP_SALT ?? "commerce360-waitlist-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Atomic count-and-record via the waitlist_check_rate_limit RPC.
 * Limits: 3 requests/hour, plus a 1 request/minute cooldown.
 *
 * Fails OPEN: if the RPC errors (e.g. migration not applied, transient outage)
 * we log and allow the request. Rate limiting is defense-in-depth here — the
 * other validation layers still run — so an infra hiccup must not lock out real
 * signups.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc("waitlist_check_rate_limit", {
      p_ip_hash: hashIp(ip),
    });

    if (error) {
      console.error("Waitlist rate-limit RPC error:", error.message);
      return "ok";
    }

    if (data === "hourly") return "hourly";
    if (data === "cooldown") return "cooldown";
    return "ok";
  } catch (err) {
    console.error("Waitlist rate-limit error:", err);
    return "ok";
  }
}
