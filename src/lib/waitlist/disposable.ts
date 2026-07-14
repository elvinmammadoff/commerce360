import disposableDomains from "disposable-email-domains";

// Supplemental blocklist for temp-mail domains not yet in the maintained
// package. No static list is exhaustive — providers rotate domains constantly —
// so add ones observed slipping through here.
const EXTRA_DISPOSABLE = ["ezimb.com"];

// Materialize the maintained list into a Set once for O(1) lookups.
const DISPOSABLE = new Set<string>(
  [...(disposableDomains as string[]), ...EXTRA_DISPOSABLE].map((d) =>
    d.toLowerCase(),
  ),
);

/** True when the domain belongs to a known disposable/temp-mail provider. */
export function isDisposableDomain(domain: string): boolean {
  if (!domain) return false;
  return DISPOSABLE.has(domain.toLowerCase());
}
