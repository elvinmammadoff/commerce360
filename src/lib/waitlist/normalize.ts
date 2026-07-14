/** Trim surrounding whitespace and lowercase the whole address. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Return the domain part of an already-normalized email, or "" if malformed. */
export function getDomain(email: string): string {
  return email.split("@")[1] ?? "";
}
