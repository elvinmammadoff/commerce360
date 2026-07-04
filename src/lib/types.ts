/**
 * Domain models for Commerce360 AI.
 *
 * Phase 1 serves these from local fixtures via `lib/data`. Phase 2 swaps the
 * repository layer for Supabase — these shapes are designed to map 1:1 onto
 * future tables, so pages and components never change.
 */

// ---------------------------------------------------------------------------
// Plans & billing
// ---------------------------------------------------------------------------

export type PlanId = "starter" | "growth" | "scale" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number | null; // USD; null = custom pricing
  priceYearly: number | null; // USD per month, billed annually
  creditsPerMonth: number | null; // null = custom pool
  frameResolution: "2048²" | "4K";
  videoResolution: "1080p" | "4K";
  seats: number | null;
  features: string[];
  highlighted?: boolean;
}

export interface CreditPack {
  id: string;
  credits: number;
  price: number; // USD
  perCredit: number; // USD
  bestValue?: boolean;
}

export type InvoiceStatus = "paid" | "open" | "upcoming" | "refunded";

export interface Invoice {
  id: string; // e.g. INV-2026-0583
  date: string; // ISO
  description: string;
  amount: number; // USD
  status: InvoiceStatus;
}

export interface PaymentMethod {
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  expMonth: number;
  expYear: number;
}

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

export type CreditEntryType =
  | "generation"
  | "refund"
  | "plan_grant"
  | "pack_purchase"
  | "bonus";

export interface CreditEntry {
  id: string;
  type: CreditEntryType;
  description: string;
  amount: number; // positive = grant, negative = spend
  balanceAfter: number;
  createdAt: string; // ISO
}

// ---------------------------------------------------------------------------
// Products & generation pipeline
// ---------------------------------------------------------------------------

export type ProductStatus =
  | "draft"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type ProductCategory =
  | "seating"
  | "tables"
  | "beds"
  | "lighting"
  | "storage"
  | "sofas";

export interface ProductAssets {
  /** Seamless orbit loop; also drives the 360° viewer via scrubbing. */
  orbitVideoUrl: string;
  videoResolution: "1080p" | "4K";
  videoDurationSeconds: number;
  videoSizeMb: number;
  frameCount: number; // 72 stills at 5° intervals
  frameResolution: number; // px, square
  packageSizeMb: number; // full ZIP download
  marketplaceSetSizeMb: number;
}

export interface Product {
  id: string; // prd_*
  name: string;
  sku: string;
  category: ProductCategory;
  status: ProductStatus;
  version: number; // current render version (v1, v2, …)
  createdAt: string;
  completedAt: string | null;
  creditsUsed: number;
  views: number; // share page + embed views
  downloads: number;
  shareSlug: string | null;
  sourceImageName: string;
  renderSeconds: number | null;
  assets: ProductAssets | null;
  failureReason?: string;
}

export type JobStatus = "queued" | "running" | "completed" | "failed";

/** Pipeline stage ids, in execution order. Mirrors the production pipeline. */
export type StageId =
  | "queued"
  | "normalizing"
  | "rendering"
  | "upscaling"
  | "extracting"
  | "packaging";

export interface StageDef {
  id: StageId;
  label: string;
  description: string;
  engine: string;
  /** Typical wall-clock seconds in production (shown in the UI). */
  typicalSeconds: number;
  /** Seconds the demo simulator spends in this stage. */
  simSeconds: number;
}

export interface GenerationJob {
  id: string; // job_*
  productId: string;
  productName: string;
  version: number;
  status: JobStatus;
  /** Current stage while running; last reached stage otherwise. */
  stage: StageId;
  /** Overall progress 0–100. */
  progress: number;
  settings: string; // e.g. "Studio white · 72 frames · 4K"
  createdAt: string;
  finishedAt: string | null;
  durationSeconds: number | null;
  creditsUsed: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Workspace, team, account
// ---------------------------------------------------------------------------

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: PlanId;
  creditsBalance: number;
  creditsPerMonth: number;
  renewsAt: string; // ISO
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  title: string;
  initials: string;
  role: TeamRole;
}

export type TeamRole = "owner" | "admin" | "member";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  initials: string;
  status: "active" | "invited";
  joinedAt: string | null;
}

// ---------------------------------------------------------------------------
// Activity & notifications
// ---------------------------------------------------------------------------

export type ActivityType =
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "download"
  | "member_invited"
  | "api_key_created"
  | "plan_started"
  | "credits_added";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  actor: string;
  createdAt: string;
  href?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  tone: "success" | "info" | "warning";
  href?: string;
}

// ---------------------------------------------------------------------------
// API access
// ---------------------------------------------------------------------------

export interface ApiKey {
  id: string;
  name: string;
  maskedKey: string; // "c360_live_••••4f2a"
  createdAt: string;
  lastUsedAt: string | null;
  requestsThisMonth: number;
  status: "active" | "revoked";
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "DELETE";
  path: string;
  summary: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface EngagementPoint {
  date: string; // ISO day
  views: number;
  interactions: number; // viewer drags / plays
}

export interface AdminStats {
  mrr: number;
  mrrGrowthPct: number;
  activeWorkspaces: number;
  workspacesGrowthPct: number;
  jobsToday: number;
  successRatePct: number;
  avgRenderSeconds: number;
  gpuUtilizationPct: number;
  uptimePct: number;
}

export interface RevenuePoint {
  month: string; // "Feb", …
  mrr: number;
  workspaces: number;
}

export interface AdminWorkspaceRow {
  id: string;
  company: string;
  plan: PlanId;
  products: number;
  creditsUsed: number;
  mrr: number;
  status: "active" | "trial" | "past_due";
  joinedAt: string;
}

export interface AdminJobRow {
  id: string;
  workspace: string;
  product: string;
  stage: StageId | "completed" | "failed";
  status: JobStatus;
  progress: number;
  startedAt: string;
}

// ---------------------------------------------------------------------------
// Marketing content
// ---------------------------------------------------------------------------

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  initials: string;
}

export interface Faq {
  question: string;
  answer: string;
}
