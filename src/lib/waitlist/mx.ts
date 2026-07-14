import { resolveMx } from "node:dns/promises";

const MX_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("mx-timeout")),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * Resolve MX records for a domain with a hard 2s timeout.
 * Returns false on timeout, DNS failure, or an empty record set — the caller
 * turns that into a friendly validation error rather than a thrown exception.
 * Requires the Node.js runtime (node:dns is unavailable on the Edge runtime).
 */
export async function domainHasMx(domain: string): Promise<boolean> {
  if (!domain) return false;
  try {
    const records = await withTimeout(resolveMx(domain), MX_TIMEOUT_MS);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}
