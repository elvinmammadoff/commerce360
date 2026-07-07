/**
 * Shared between the edge middleware and the server auth helpers.
 * Keep this module dependency-free so it bundles cleanly in both runtimes.
 */

/** Session cookie holding the signed-in platform role. */
export const ROLE_COOKIE = "c360-role";
