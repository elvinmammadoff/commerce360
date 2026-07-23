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
  NotificationPreferences,
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

import { notifications } from "./fixtures/activity";
import {
  adminAdjustments,
  adminJobs,
  adminLedgers,
  adminNotifications,
  adminOrders,
  adminStats,
  adminUsers,
  dailyRenders,
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
  avatar_url?: string | null;
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

/**
 * Laravel stores timestamps in UTC but sometimes without a timezone suffix
 * ("2026-07-19 10:30:00" or "2026-07-19T10:30:00"). Without the Z suffix,
 * browsers parse them as LOCAL time, producing a UTC-offset error (e.g. 4h
 * in UTC+4). Append Z when no timezone info is present.
 */
function toUtcIso(ts: string): string {
  if (!ts) return ts;
  if (ts.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(ts)) return ts;
  return ts.replace(" ", "T") + "Z";
}

function toUtcIsoNullable(ts: string | null): string | null {
  return ts ? toUtcIso(ts) : null;
}

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
    avatarUrl: u.avatar_url ?? undefined,
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
    createdAt: toUtcIso(p.created_at),
    completedAt: toUtcIsoNullable(p.completed_at),
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
    createdAt: toUtcIso(j.created_at),
    finishedAt: toUtcIsoNullable(j.finished_at),
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
    createdAt: toUtcIso(data.created_at),
  };
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const data = await apiJson<RawUser>("/api/user");
  return mapUser(data);
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const data = await apiJson<TeamMember[]>("/api/workspace/members");
    return data;
  } catch {
    return [];
  }
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
  try {
    const data = await apiJson<RawLedgerEntry[]>("/api/credits/ledger");
    return data.map((e) => ({
      id: e.id,
      type: e.type as CreditEntryType,
      description: e.description ?? "",
      amount: e.amount,
      balanceAfter: e.balance_after,
      createdAt: toUtcIso(e.created_at),
    }));
  } catch {
    return [];
  }
}

export async function getCreditPacks(): Promise<CreditPack[]> {
  return creditPacks;
}

export async function getPurchases(): Promise<Purchase[]> {
  try {
    const data = await apiJson<Purchase[]>("/api/billing/purchases");
    return data;
  } catch {
    return [];
  }
}

export async function getPaymentMethod(): Promise<PaymentMethod | null> {
  try {
    const data = await apiJson<PaymentMethod>("/api/billing/payment-method");
    return data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Activity & notifications — no real API yet, kept as fixtures
// ---------------------------------------------------------------------------

export async function getActivity(): Promise<ActivityEvent[]> {
  try {
    const products = await getProducts();
    return products
      .flatMap((p): ActivityEvent[] => {
        if (p.status === "completed" && p.completedAt) {
          return [{
            id: `completed-${p.id}`,
            type: "generation_completed",
            message: `${p.name} orbit render completed`,
            actor: "System",
            createdAt: p.completedAt,
            href: `/products/${p.id}`,
          }];
        }
        if (p.status === "failed") {
          return [{
            id: `failed-${p.id}`,
            type: "generation_failed",
            message: `${p.name} render failed`,
            actor: "System",
            createdAt: p.createdAt,
            href: `/products/${p.id}`,
          }];
        }
        if (p.status === "queued" || p.status === "processing") {
          return [{
            id: `started-${p.id}`,
            type: "generation_started",
            message: `${p.name} render started`,
            actor: "System",
            createdAt: p.createdAt,
            href: `/products/${p.id}`,
          }];
        }
        return [];
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const data = await apiJson<(Omit<NotificationItem, "createdAt"> & { created_at: string })[]>("/api/notifications");
    return data.map((n) => ({ ...n, createdAt: toUtcIso(n.created_at) }));
  } catch {
    return [];
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const data = await apiJson<{
      render_complete: boolean;
      render_failed: boolean;
      weekly_digest: boolean;
      product_news: boolean;
    }>("/api/notification-preferences");
    return {
      renderComplete: data.render_complete,
      renderFailed: data.render_failed,
      weeklyDigest: data.weekly_digest,
      productNews: data.product_news,
    };
  } catch {
    return { renderComplete: true, renderFailed: true, weeklyDigest: true, productNews: false };
  }
}

// ---------------------------------------------------------------------------
// API access — static content, kept as fixtures
// ---------------------------------------------------------------------------

export async function getApiKeys(): Promise<ApiKey[]> {
  try {
    const data = await apiJson<ApiKey[]>("/api/api-keys");
    return data;
  } catch {
    return [];
  }
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
  const points: EngagementPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({ date: d.toISOString().slice(0, 10), views: 0, interactions: 0 });
  }
  return points;
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
