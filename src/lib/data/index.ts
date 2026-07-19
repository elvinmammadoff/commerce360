import type {
  ActivityEvent,
  AdminAdjustment,
  AdminJobRow,
  AdminLedgerEntry,
  AdminOrderRow,
  AdminStats,
  AdminUserRow,
  ApiEndpoint,
  ApiKey,
  AppRole,
  CreditEntry,
  CreditEntryType,
  CreditPack,
  CurrentUser,
  DailyRenderPoint,
  EngagementPoint,
  GenerationJob,
  JobStatus,
  MonthlyRenderPoint,
  NotificationItem,
  PaymentMethod,
  Product,
  ProductAssets,
  ProductCategory,
  ProductStatus,
  Purchase,
  RevenuePoint,
  StageId,
  TeamMember,
  TeamRole,
  Testimonial,
  Faq,
  UserGrowthPoint,
  Workspace,
} from "@/lib/types";

import { apiJson } from "@/lib/api-client";

import { activityEvents, notifications } from "./fixtures/activity";
import {
  adminAdjustments,
  adminJobs,
  adminLedgers,
  adminNotifications,
  adminOrders,
  adminStats,
  adminUsers,
  dailyRenders,
  engagementSeries,
  monthlyRenders,
  revenueSeries,
  userGrowth,
} from "./fixtures/analytics";
import { apiCodeSamples, apiEndpoints, apiKeys } from "./fixtures/api";
import { creditPacks, paymentMethod, purchases } from "./fixtures/billing";
import { faqs, heroStats, testimonials, trustedByBrands } from "./fixtures/marketing";
import { adminStaff, teamMembers } from "./fixtures/workspace";

// ---------------------------------------------------------------------------
// Raw API response shapes (snake_case from Laravel)
// ---------------------------------------------------------------------------

type RawUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  title?: string | null;
};

type RawWorkspace = {
  id: string;
  name: string;
  slug: string;
  credits: number;
  total_purchased: number;
  credits_used: number;
  created_at: string;
};

type RawProduct = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  status: string;
  version: number;
  created_at: string;
  completed_at: string | null;
  credits_used: number;
  views: number;
  downloads: number;
  share_slug: string | null;
  source_image_name: string | null;
  render_seconds: number | null;
  assets: ProductAssets | null;
  failure_reason: string | null;
};

type RawJob = {
  id: string;
  product_id: string;
  product_name: string;
  version: number;
  status: string;
  stage: string;
  progress: number;
  settings: string;
  created_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  credits_used: number;
  error: string | null;
};

type RawLedgerEntry = {
  id: string;
  type: string;
  description: string | null;
  amount: number;
  balance_after: number;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapUser(u: RawUser): CurrentUser {
  const initials = u.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    title: u.title ?? "",
    initials,
    role: "owner" as TeamRole,
    appRole: (u.role === "admin" ? "admin" : "customer") as AppRole,
  };
}

function mapProduct(p: RawProduct): Product {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? "",
    category: (p.category ?? "general") as ProductCategory,
    status: p.status as ProductStatus,
    version: p.version,
    createdAt: p.created_at,
    completedAt: p.completed_at,
    creditsUsed: p.credits_used,
    views: p.views,
    downloads: p.downloads,
    shareSlug: p.share_slug,
    sourceImageName: p.source_image_name ?? "",
    renderSeconds: p.render_seconds,
    assets: p.assets,
    failureReason: p.failure_reason ?? undefined,
  };
}

function mapJob(j: RawJob): GenerationJob {
  return {
    id: j.id,
    productId: j.product_id,
    productName: j.product_name,
    version: j.version,
    status: j.status as JobStatus,
    stage: j.stage as StageId,
    progress: j.progress,
    settings: j.settings,
    createdAt: j.created_at,
    finishedAt: j.finished_at,
    durationSeconds: j.duration_seconds,
    creditsUsed: j.credits_used,
    error: j.error ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Workspace & account
// ---------------------------------------------------------------------------

export async function getWorkspace(): Promise<Workspace> {
  const data = await apiJson<RawWorkspace>("/api/workspace");
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    creditsBalance: data.credits,
    totalPurchased: data.total_purchased,
    creditsUsed: data.credits_used,
    createdAt: data.created_at,
  };
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const data = await apiJson<RawUser>("/api/user");
  return mapUser(data);
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return teamMembers;
}

// ---------------------------------------------------------------------------
// Products & jobs
// ---------------------------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  const data = await apiJson<RawProduct[]>("/api/products");
  return data
    .map(mapProduct)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getProduct(id: string): Promise<Product | undefined> {
  try {
    const data = await apiJson<RawProduct>(`/api/products/${id}`);
    return mapProduct(data);
  } catch {
    return undefined;
  }
}

/**
 * Resolve a product by its public share slug — used by the account-free
 * `/view` and `/embed` routes. Hits the public share endpoint first, then
 * falls back to the bundled catalog so the demo links always resolve.
 */
export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  try {
    const data = await apiJson<RawProduct>(`/api/share/${slug}`);
    return mapProduct(data);
  } catch {
    const { products } = await import("./fixtures/products");
    return products.find(
      (p) => p.shareSlug === slug && p.status === "completed" && p.assets,
    );
  }
}

export async function getJobs(): Promise<GenerationJob[]> {
  const data = await apiJson<RawJob[]>("/api/jobs");
  return data.map(mapJob);
}

export async function getActiveJobs(): Promise<GenerationJob[]> {
  const data = await apiJson<RawJob[]>("/api/jobs?status=active");
  return data.map(mapJob);
}

// ---------------------------------------------------------------------------
// Credits & billing
// ---------------------------------------------------------------------------

export async function getCreditLedger(): Promise<CreditEntry[]> {
  const data = await apiJson<RawLedgerEntry[]>("/api/credits/ledger");
  return data.map((e) => ({
    id: e.id,
    type: e.type as CreditEntryType,
    description: e.description ?? "",
    amount: e.amount,
    balanceAfter: e.balance_after,
    createdAt: e.created_at,
  }));
}

export async function getCreditPacks(): Promise<CreditPack[]> {
  return creditPacks;
}

export async function getPurchases(): Promise<Purchase[]> {
  return purchases;
}

export async function getPaymentMethod(): Promise<PaymentMethod> {
  return paymentMethod;
}

// ---------------------------------------------------------------------------
// Activity & notifications — no real API yet, kept as fixtures
// ---------------------------------------------------------------------------

export async function getActivity(): Promise<ActivityEvent[]> {
  return activityEvents;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  return notifications;
}

// ---------------------------------------------------------------------------
// API access — static content, kept as fixtures
// ---------------------------------------------------------------------------

export async function getApiKeys(): Promise<ApiKey[]> {
  return apiKeys;
}

export async function getApiEndpoints(): Promise<ApiEndpoint[]> {
  return apiEndpoints;
}

export function getApiCodeSamples() {
  return apiCodeSamples;
}

// ---------------------------------------------------------------------------
// Analytics — admin only, kept as fixtures
// ---------------------------------------------------------------------------

export async function getEngagementSeries(): Promise<EngagementPoint[]> {
  return engagementSeries;
}

export async function getAdminStats(): Promise<AdminStats> {
  return adminStats;
}

export async function getRevenueSeries(): Promise<RevenuePoint[]> {
  return revenueSeries;
}

export async function getDailyRenders(): Promise<DailyRenderPoint[]> {
  return dailyRenders;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  return adminUsers;
}

export async function getAdminUser(
  id: string,
): Promise<AdminUserRow | undefined> {
  return adminUsers.find((u) => u.id === id);
}

export async function getAdminOrders(): Promise<AdminOrderRow[]> {
  return adminOrders;
}

export async function getAdminOrdersForCustomer(
  company: string,
): Promise<AdminOrderRow[]> {
  return adminOrders.filter((o) => o.customer === company);
}

export async function getAdminJobs(): Promise<AdminJobRow[]> {
  return adminJobs;
}

export async function getAdminLedger(
  userId: string,
): Promise<AdminLedgerEntry[]> {
  return adminLedgers
    .filter((entry) => entry.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getAdminAdjustments(): Promise<AdminAdjustment[]> {
  return adminAdjustments;
}

export async function getMonthlyRenders(): Promise<MonthlyRenderPoint[]> {
  return monthlyRenders;
}

export async function getUserGrowth(): Promise<UserGrowthPoint[]> {
  return userGrowth;
}

export async function getAdminNotifications(): Promise<NotificationItem[]> {
  return adminNotifications;
}

// ---------------------------------------------------------------------------
// Admin account & staff
// ---------------------------------------------------------------------------

export async function getAdminAccount(): Promise<CurrentUser> {
  return getCurrentUser();
}

export async function getAdminStaff(): Promise<TeamMember[]> {
  return adminStaff;
}

// ---------------------------------------------------------------------------
// Marketing content — static
// ---------------------------------------------------------------------------

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}

export async function getFaqs(): Promise<Faq[]> {
  return faqs;
}

export async function getTrustedByBrands(): Promise<string[]> {
  return trustedByBrands;
}

export async function getHeroStats() {
  return heroStats;
}
