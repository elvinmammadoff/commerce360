// Pragmatic email shape check. Full RFC 5322 is intentionally NOT used: the
// real regex accepts addresses no mail provider will deliver to. This matches
// the shape every provider actually accepts and caps total length per RFC.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailSyntax(email: string): boolean {
  const value = email.trim();
  return value.length > 0 && value.length <= 254 && EMAIL_RE.test(value);
}
