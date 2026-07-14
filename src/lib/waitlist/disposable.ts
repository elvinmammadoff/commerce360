import disposableDomains from "disposable-email-domains";

// Materialize the maintained list into a Set once for O(1) lookups.
const DISPOSABLE = new Set<string>(
  (disposableDomains as string[]).map((d) => d.toLowerCase()),
);

/** True when the domain belongs to a known disposable/temp-mail provider. */
export function isDisposableDomain(domain: string): boolean {
  if (!domain) return false;
  return DISPOSABLE.has(domain.toLowerCase());
}
