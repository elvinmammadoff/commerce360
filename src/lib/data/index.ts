/**
 * Data access layer.
 *
 * Every page and server component reads through these async functions —
 * never from fixtures directly. Phase 2 replaces the bodies with Supabase
 * queries; signatures (and therefore the entire UI) stay unchanged.
 */

import type {
  ActivityEvent,
  AdminJobRow,
  AdminStats,
  AdminWorkspaceRow,
  ApiEndpoint,
  ApiKey,
  CreditEntry,
  CreditPack,
  CurrentUser,
  EngagementPoint,
  GenerationJob,
  Invoice,
  NotificationItem,
  PaymentMethod,
  Plan,
  Product,
  RevenuePoint,
  TeamMember,
  Testimonial,
  Faq,
  Workspace,
} from "@/lib/types";

import { activityEvents, notifications } from "./fixtures/activity";
import { adminJobs, adminStats, adminWorkspaces, engagementSeries, revenueSeries } from "./fixtures/analytics";
import { apiCodeSamples, apiEndpoints, apiKeys } from "./fixtures/api";
import { creditPacks, invoices, paymentMethod, plans } from "./fixtures/billing";
import { creditLedger } from "./fixtures/credits";
import { jobs } from "./fixtures/jobs";
import { faqs, heroStats, testimonials, trustedByBrands } from "./fixtures/marketing";
import { products } from "./fixtures/products";
import { currentUser, teamMembers, workspace } from "./fixtures/workspace";

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

export async function getPlans(): Promise<Plan[]> {
  return plans;
}

export async function getCreditPacks(): Promise<CreditPack[]> {
  return creditPacks;
}

export async function getInvoices(): Promise<Invoice[]> {
  return invoices;
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

export async function getAdminWorkspaces(): Promise<AdminWorkspaceRow[]> {
  return adminWorkspaces;
}

export async function getAdminJobs(): Promise<AdminJobRow[]> {
  return adminJobs;
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
