import type { CurrentUser, TeamMember, Workspace } from "@/lib/types";

/**
 * Demo persona: Fernhaven Home — a furniture brand one week into onboarding
 * its first collection. Every number elsewhere (credit wallet, purchases,
 * jobs) stays consistent with this timeline: 1 free signup credit + 30
 * purchased (Studio 5 + Workshop 25), less 7 renders, plus 2 refunds = 26.
 */
export const workspace: Workspace = {
  id: "ws_fernhaven",
  name: "Fernhaven Home",
  slug: "fernhaven",
  creditsBalance: 26,
  totalPurchased: 30,
  creditsUsed: 7,
  createdAt: "2026-06-26T09:00:00Z",
};

export const currentUser: CurrentUser = {
  id: "usr_maya",
  name: "Maya Lindqvist",
  email: "maya@fernhaven.com",
  title: "Head of E-commerce",
  initials: "ML",
  role: "owner",
  appRole: "customer",
};

/**
 * Staff persona for the internal admin console — signs in via the "Admin"
 * demo account on the login page. Not a customer; has no workspace wallet.
 */
export const adminAccount: CurrentUser = {
  id: "usr_staff_jonas",
  name: "Jonas Weber",
  email: "jonas@orbittify.com",
  title: "Platform Operations",
  initials: "JW",
  role: "owner",
  appRole: "admin",
};

/** Orbittify staff with admin-console access, managed in Admin → Settings. */
export const adminStaff: TeamMember[] = [
  {
    id: "staff_01",
    name: "Jonas Weber",
    email: "jonas@orbittify.com",
    role: "owner",
    initials: "JW",
    status: "active",
    joinedAt: "2026-01-12T09:00:00Z",
  },
  {
    id: "staff_02",
    name: "Elena Fischer",
    email: "elena@orbittify.com",
    role: "admin",
    initials: "EF",
    status: "active",
    joinedAt: "2026-02-03T10:30:00Z",
  },
  {
    id: "staff_03",
    name: "Tomas Lindgren",
    email: "tomas@orbittify.com",
    role: "member",
    initials: "TL",
    status: "invited",
    joinedAt: null,
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "mem_01",
    name: "Maya Lindqvist",
    email: "maya@fernhaven.com",
    role: "owner",
    initials: "ML",
    status: "active",
    joinedAt: "2026-06-26T09:00:00Z",
  },
  {
    id: "mem_02",
    name: "Daniel Reyes",
    email: "daniel@fernhaven.com",
    role: "admin",
    initials: "DR",
    status: "active",
    joinedAt: "2026-06-29T14:20:00Z",
  },
  {
    id: "mem_03",
    name: "Priya Sharma",
    email: "priya@fernhaven.com",
    role: "member",
    initials: "PS",
    status: "invited",
    joinedAt: null,
  },
];
