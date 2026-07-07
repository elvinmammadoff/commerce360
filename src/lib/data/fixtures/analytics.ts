import type {
  AdminJobRow,
  AdminStats,
  AdminWorkspaceRow,
  EngagementPoint,
  RevenuePoint,
} from "@/lib/types";

/**
 * Viewer engagement for the workspace's share pages and embeds — starts when
 * the first product went live (Jun 27) and grows as the two viewers get
 * embedded on fernhaven.com product pages.
 */
export const engagementSeries: EngagementPoint[] = [
  { date: "2026-06-21", views: 0, interactions: 0 },
  { date: "2026-06-22", views: 0, interactions: 0 },
  { date: "2026-06-23", views: 0, interactions: 0 },
  { date: "2026-06-24", views: 0, interactions: 0 },
  { date: "2026-06-25", views: 0, interactions: 0 },
  { date: "2026-06-26", views: 2, interactions: 1 },
  { date: "2026-06-27", views: 9, interactions: 4 },
  { date: "2026-06-28", views: 14, interactions: 7 },
  { date: "2026-06-29", views: 18, interactions: 9 },
  { date: "2026-06-30", views: 26, interactions: 15 },
  { date: "2026-07-01", views: 41, interactions: 22 },
  { date: "2026-07-02", views: 55, interactions: 31 },
  { date: "2026-07-03", views: 78, interactions: 46 },
  { date: "2026-07-04", views: 64, interactions: 39 },
];

// ---------------------------------------------------------------------------
// Platform admin (internal ops view)
// ---------------------------------------------------------------------------

export const adminStats: AdminStats = {
  revenue: 61480,
  revenueGrowthPct: 18.2,
  activeWorkspaces: 517,
  workspacesGrowthPct: 9.4,
  jobsToday: 1943,
  successRatePct: 98.4,
  avgRenderSeconds: 662,
  gpuUtilizationPct: 71,
  uptimePct: 99.98,
};

export const revenueSeries: RevenuePoint[] = [
  { month: "Feb", revenue: 18240, workspaces: 168 },
  { month: "Mar", revenue: 24610, workspaces: 224 },
  { month: "Apr", revenue: 31890, workspaces: 291 },
  { month: "May", revenue: 40310, workspaces: 366 },
  { month: "Jun", revenue: 52140, workspaces: 452 },
  { month: "Jul", revenue: 61480, workspaces: 517 },
];

export const adminWorkspaces: AdminWorkspaceRow[] = [
  {
    id: "ws_2081",
    company: "Møbelhuset Nord",
    plan: "scale",
    products: 412,
    creditsUsed: 1893,
    revenue: 199,
    status: "active",
    joinedAt: "2026-02-11T00:00:00Z",
  },
  {
    id: "ws_2114",
    company: "Casa Verde Interiors",
    plan: "growth",
    products: 148,
    creditsUsed: 512,
    revenue: 79,
    status: "active",
    joinedAt: "2026-03-02T00:00:00Z",
  },
  {
    id: "ws_2246",
    company: "Volt & Vine Electronics",
    plan: "scale",
    products: 336,
    creditsUsed: 1204,
    revenue: 199,
    status: "active",
    joinedAt: "2026-03-19T00:00:00Z",
  },
  {
    id: "ws_2307",
    company: "Atelier Ruben",
    plan: "starter",
    products: 34,
    creditsUsed: 86,
    revenue: 29,
    status: "active",
    joinedAt: "2026-04-05T00:00:00Z",
  },
  {
    id: "ws_2389",
    company: "Nordvik Living",
    plan: "enterprise",
    products: 1240,
    creditsUsed: 4820,
    revenue: 1450,
    status: "active",
    joinedAt: "2026-04-22T00:00:00Z",
  },
  {
    id: "ws_2455",
    company: "Hemlund & Co.",
    plan: "growth",
    products: 96,
    creditsUsed: 301,
    revenue: 79,
    status: "past_due",
    joinedAt: "2026-05-14T00:00:00Z",
  },
  {
    id: "ws_2521",
    company: "Fernhaven Home",
    plan: "growth",
    products: 8,
    creditsUsed: 7,
    revenue: 79,
    status: "active",
    joinedAt: "2026-06-26T00:00:00Z",
  },
  {
    id: "ws_2544",
    company: "Studio Marrow",
    plan: "starter",
    products: 3,
    creditsUsed: 5,
    revenue: 0,
    status: "trial",
    joinedAt: "2026-07-01T00:00:00Z",
  },
];

export const adminJobs: AdminJobRow[] = [
  {
    id: "job_88412",
    workspace: "Nordvik Living",
    product: "Brekke Dining Table — Smoked Oak",
    stage: "upscaling",
    status: "running",
    progress: 74,
    startedAt: "2026-07-04T12:04:00Z",
  },
  {
    id: "job_88411",
    workspace: "Møbelhuset Nord",
    product: "Lofoten Armchair — Charcoal",
    stage: "rendering",
    status: "running",
    progress: 51,
    startedAt: "2026-07-04T12:06:00Z",
  },
  {
    id: "job_88409",
    workspace: "Fernhaven Home",
    product: "Aria Bouclé Armchair — Ivory",
    stage: "rendering",
    status: "running",
    progress: 46,
    startedAt: "2026-07-04T11:32:00Z",
  },
  {
    id: "job_88407",
    workspace: "Volt & Vine Electronics",
    product: "Pulse Mini Speaker — Slate",
    stage: "extracting",
    status: "running",
    progress: 88,
    startedAt: "2026-07-04T11:58:00Z",
  },
  {
    id: "job_88406",
    workspace: "Casa Verde Interiors",
    product: "Terra Planter Set — Clay",
    stage: "completed",
    status: "completed",
    progress: 100,
    startedAt: "2026-07-04T11:47:00Z",
  },
  {
    id: "job_88402",
    workspace: "Studio Marrow",
    product: "Arc Table Lamp — Cream",
    stage: "failed",
    status: "failed",
    progress: 0,
    startedAt: "2026-07-04T11:31:00Z",
  },
  {
    id: "job_88399",
    workspace: "Møbelhuset Nord",
    product: "Vega Bookshelf — Birch",
    stage: "completed",
    status: "completed",
    progress: 100,
    startedAt: "2026-07-04T11:22:00Z",
  },
];
