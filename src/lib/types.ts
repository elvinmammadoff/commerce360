/**
 * Domain models for Orbittify.
 *
 * Phase 1 serves these from local fixtures via `lib/data`. Phase 2 swaps the
 * repository layer for Supabase — these shapes are designed to map 1:1 onto
 * future tables, so pages and components never change.
 */

// ---------------------------------------------------------------------------
// Roles & access control
// ---------------------------------------------------------------------------

/**
 * Platform-level role. Customers use the workspace app; admins additionally
 * get the internal admin console at /admin. Distinct from `TeamRole`, which
 * scopes permissions *within* a customer workspace.
 */
export type AppRole = "customer" | "admin";

// ---------------------------------------------------------------------------
// Credit packs & billing
// ---------------------------------------------------------------------------

/**
 * A one-time credit pack. No recurring billing — each pack is a single Stripe
 * checkout that adds credits to the wallet. 1 credit = 1 complete pipeline
 * render.
 */
export interface CreditPack {
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

/**
 * Interactive hotspot pinned to the 360° viewer. Appears while the orbit is
 * near `angle`, positioned at `x`/`y` over the stage. Premium feature — drives
 * "Buy now", "See material", "View specs" style callouts.
 */
export interface Hotspot {
  id: string;
  label: string;
  /** Orbit angle (degrees, 0–359) at which the hotspot is centered. */
  angle: number;
  /** Position over the stage, 0–100 percent of width/height. */
  x: number;
  y: number;
  /** Optional link opened on click (e.g. add-to-cart, spec sheet). */
  href?: string;
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
  /** Pre-rendered sample product — shown with a Demo badge, not charged credits. */
  isDemo?: boolean;
  /** Interactive viewer hotspots (premium). */
  hotspots?: Hotspot[];
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
  /** Platform role — drives access to the internal admin console. */
  appRole: AppRole;
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

/** Platform-wide KPIs for the internal admin ops view — one-time credit model. */
export interface AdminStats {
  totalRevenue: number; // lifetime credit sales (USD)
  revenueGrowthPct: number;
  creditSales30d: number; // credit sales in the last 30 days (USD)
  creditsSold: number; // lifetime credits sold
  creditsUsed: number; // lifetime credits consumed by renders
  totalUsers: number;
  activeUsers: number; // active in the last 30 days
  usersGrowthPct: number;
  productsRendered: number; // lifetime completed renders
  pendingJobs: number; // queued + running right now
  failedJobs: number; // failed in the last 30 days
  avgOrderValue: number; // USD per one-time purchase
}

export interface RevenuePoint {
  month: string; // "Feb", …
  revenue: number; // credit sales that month (USD)
  creditsSold: number; // credits sold that month
}

/** One day of platform-wide render throughput. */
export interface DailyRenderPoint {
  date: string; // ISO day
  renders: number;
}

export type AdminUserStatus = "active" | "inactive" | "suspended";

/** A customer account in the admin users table — credit wallet, no subscription. */
export interface AdminUserRow {
  id: string;
  name: string;
  company: string;
  email: string;
  creditBalance: number; // available credits
  creditsPurchased: number; // lifetime credits bought
  creditsUsed: number; // lifetime credits consumed
  purchases: number; // number of one-time purchases (purchase history size)
  status: AdminUserStatus;
  joinedAt: string;
}

/** A single one-time credit purchase, platform-wide, for the admin orders table. */
export interface AdminOrderRow {
  id: string; // Stripe PaymentIntent id
  customer: string; // company name
  packName: string; // credit pack purchased
  credits: number;
  amount: number; // USD charged
  purchasedAt: string; // ISO
  status: PaymentStatus;
}

export interface AdminJobRow {
  id: string;
  workspace: string;
  product: string;
  stage: StageId | "completed" | "failed";
  status: JobStatus;
  progress: number;
  startedAt: string;
  /** Failure reason — present on failed jobs only. */
  error?: string;
}

/** One month of platform-wide render throughput. */
export interface MonthlyRenderPoint {
  month: string; // "Feb", …
  renders: number;
}

/** Cumulative registered users, by month. */
export interface UserGrowthPoint {
  month: string; // "Feb", …
  users: number;
}

/** A manual credit grant/deduction performed by Orbittify staff. */
export interface AdminAdjustment {
  id: string; // adj_*
  customer: string; // company name
  amount: number; // credits; positive = grant, negative = deduction
  reason: string;
  admin: string; // staff member who performed it
  createdAt: string; // ISO
}

export type AdminLedgerType = "render" | "refund" | "bonus" | "adjustment";

/** One usage-history line on a customer's wallet, for the admin user profile. */
export interface AdminLedgerEntry {
  id: string;
  userId: string; // AdminUserRow id
  type: AdminLedgerType;
  description: string;
  amount: number; // credits; positive = grant, negative = spend
  createdAt: string; // ISO
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
