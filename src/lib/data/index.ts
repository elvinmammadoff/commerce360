/**
 * Data access layer.
 *
 * Every page and server component reads through these async functions —
 * never from fixtures directly. Phase 2 replaces the bodies with Supabase
 * queries; signatures (and therefore the entire UI) stay unchanged.
 */

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
  CreditEntry,
  CreditPack,
  CurrentUser,
  DailyRenderPoint,
  EngagementPoint,
  GenerationJob,
  MonthlyRenderPoint,
  NotificationItem,
  PaymentMethod,
  Product,
  Purchase,
  RevenuePoint,
  TeamMember,
  Testimonial,
  Faq,
  UserGrowthPoint,
  Workspace,
} from "@/lib/types";

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
import { creditLedger } from "./fixtures/credits";
import { jobs } from "./fixtures/jobs";
import { faqs, heroStats, testimonials, trustedByBrands } from "./fixtures/marketing";
import { products } from "./fixtures/products";
import { adminAccount, adminStaff, currentUser, teamMembers, workspace } from "./fixtures/workspace";

// -- Workspace & account ----------------------------------------------------

export async function getWorkspace(): Promise<Workspace> {
  return workspace;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return currentUser;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return teamMembers;
}

// -- Products & jobs ---------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return products.find((p) => p.id === id);
}

export async function getJobs(): Promise<GenerationJob[]> {
  return jobs;
}

export async function getActiveJobs(): Promise<GenerationJob[]> {
  return jobs.filter((j) => j.status === "queued" || j.status === "running");
}

// -- Credits & billing --------------------------------------------------------

export async function getCreditLedger(): Promise<CreditEntry[]> {
  return creditLedger;
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

// -- Activity & notifications -------------------------------------------------

export async function getActivity(): Promise<ActivityEvent[]> {
  return activityEvents;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  return notifications;
}

// -- API access ----------------------------------------------------------------

export async function getApiKeys(): Promise<ApiKey[]> {
  return apiKeys;
}

export async function getApiEndpoints(): Promise<ApiEndpoint[]> {
  return apiEndpoints;
}

export function getApiCodeSamples() {
  return apiCodeSamples;
}

// -- Analytics ------------------------------------------------------------------

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

/** Purchase history for one customer, for the admin user profile. */
export async function getAdminOrdersForCustomer(
  company: string,
): Promise<AdminOrderRow[]> {
  return adminOrders.filter((o) => o.customer === company);
}

export async function getAdminJobs(): Promise<AdminJobRow[]> {
  return adminJobs;
}

/** Usage history (wallet ledger) for one customer, newest first. */
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

// -- Admin account & staff -----------------------------------------------------

export async function getAdminAccount(): Promise<CurrentUser> {
  return adminAccount;
}

export async function getAdminStaff(): Promise<TeamMember[]> {
  return adminStaff;
}

// -- Marketing content ------------------------------------------------------------

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
