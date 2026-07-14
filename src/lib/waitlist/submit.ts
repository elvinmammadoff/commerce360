import { getSupabaseClient } from "@/lib/supabase";

import { isDisposableDomain } from "./disposable";
import { WAITLIST_MESSAGES } from "./messages";
import { domainHasMx } from "./mx";
import { getDomain, normalizeEmail } from "./normalize";
import { checkRateLimit } from "./rate-limit";
import { isValidEmailSyntax } from "./syntax";

export type WaitlistInput = {
  email: string;
  /** Honeypot field value. Non-empty => bot. */
  honeypot?: string;
  /** Client IP used for rate limiting. */
  ip: string;
};

export type WaitlistResult = { error: string | null };

/**
 * Full server-side waitlist pipeline. Order (cheapest reject first, expensive
 * network calls last):
 *   honeypot -> syntax -> normalize -> disposable -> rate limit -> MX -> insert
 */
export async function submitWaitlist({
  email,
  honeypot = "",
  ip,
}: WaitlistInput): Promise<WaitlistResult> {
  // 1. Honeypot — a filled hidden field means a bot. Return the SAME success
  //    response as a real signup and write nothing, so detection is invisible.
  if (honeypot.trim() !== "") {
    return { error: null };
  }

  // 2. Syntax
  if (!isValidEmailSyntax(email)) {
    return { error: WAITLIST_MESSAGES.invalidSyntax };
  }

  // 3. Normalize
  const normalized = normalizeEmail(email);
  const domain = getDomain(normalized);

  // 4. Disposable domain
  if (isDisposableDomain(domain)) {
    return { error: WAITLIST_MESSAGES.disposable };
  }

  // 5. Rate limit (records the attempt only when allowed)
  const rate = await checkRateLimit(ip);
  if (rate === "hourly") return { error: WAITLIST_MESSAGES.rateLimited };
  if (rate === "cooldown") return { error: WAITLIST_MESSAGES.cooldown };

  // 6. MX lookup (2s timeout; false on timeout/DNS failure/no records)
  if (!(await domainHasMx(domain))) {
    return { error: WAITLIST_MESSAGES.mxUnverifiable };
  }

  // 7. Insert. The unique constraint is the single source of truth for
  //    duplicates — no pre-query — and a duplicate is treated as success so
  //    existing emails cannot be enumerated.
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("waitlist")
      .insert({ email: normalized, source: "marketing_page" });

    if (error) {
      if (error.code === "23505") {
        return { error: null };
      }
      console.error("Waitlist insert error:", error.message);
      return { error: WAITLIST_MESSAGES.generic };
    }
  } catch (err) {
    console.error("Waitlist insert threw:", err);
    return { error: WAITLIST_MESSAGES.generic };
  }

  return { error: null };
}
