import type { CurrentUser, TeamMember, Workspace } from "@/lib/types";

/**
 * Demo persona: Fernhaven Home — a furniture brand one week into onboarding
 * its first collection. Every number elsewhere (credits, jobs, invoices)
 * stays consistent with this timeline.
 */
export const workspace: Workspace = {
  id: "ws_fernhaven",
  name: "Fernhaven Home",
  slug: "fernhaven",
  plan: "growth",
  creditsBalance: 75,
  creditsPerMonth: 80,
  renewsAt: "2026-07-26T09:00:00Z",
  createdAt: "2026-06-26T09:00:00Z",
};

export const currentUser: CurrentUser = {
  id: "usr_maya",
  name: "Maya Lindqvist",
  email: "maya@fernhaven.com",
  title: "Head of E-commerce",
  initials: "ML",
  role: "owner",
};

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
