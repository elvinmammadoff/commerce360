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

/** Segments used only by the internal admin analytics view. */
export type PlanId = "starter" | "growth" | "scale" | "enterprise";

/**
 * One-time credit purchase plan (a "credit pack"). No recurring billing —
 * each plan is a single Stripe checkout that adds credits to the wallet.
 * 1 credit = 1 complete pipeline render.
 */
export interface CreditPlan {
  id: string;
  name: string;
  price: number; // one-time USD
  credits: number;
  perProduct: number; // effective USD per product
  features: string[];
  cta: string; // button label, e.g. "Buy Starter"
  highlighted?: boolean; // "Most popular" card
}

/** Stripe payment status for a one-time purchase. */
export type PaymentStatus = "succeeded" | "processing" | "refunded" | "failed";

/** A single one-time Stripe credit purchase (no recurring invoices). */
export interface Purchase {
  id: string; // Stripe PaymentIntent id, e.g. pi_3Q7...
  packName: string; // credit pack purchased, e.g. "Studio"
  credits: number; // credits added to the wallet
  amount: number; // USD charged
  purchasedAt: string; // ISO
  status: PaymentStatus;
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
  /** Credit wallet — one-time purchase model, no subscription. */
  creditsBalance: number; // available credits, ready to spend
  totalPurchased: number; // lifetime credits bought (settled purchases)
  creditsUsed: number; // lifetime credits consumed by renders
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
  revenue: number; // one-time credit sales, trailing 30 days (USD)
  revenueGrowthPct: number;
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
  revenue: number; // credit sales that month (USD)
  workspaces: number;
}

export interface AdminWorkspaceRow {
  id: string;
  company: string;
  plan: PlanId;
  products: number;
  creditsUsed: number;
  revenue: number; // lifetime credit spend (USD)
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
