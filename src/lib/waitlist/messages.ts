/**
 * User-facing validation messages for the waitlist flow.
 * Kept deliberately generic so they never leak which layer rejected a request.
 */
export const WAITLIST_MESSAGES = {
  invalidSyntax: "Enter a valid email address.",
  disposable: "Temporary or disposable email addresses aren't allowed.",
  mxUnverifiable:
    "We couldn't verify that email domain. Please use a different address.",
  rateLimited: "Too many attempts. Please try again later.",
  cooldown: "Please wait a moment before trying again.",
  generic: "Something went wrong. Please try again.",
} as const;
