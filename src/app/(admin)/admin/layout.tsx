import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { requireAdmin } from "@/lib/auth";
import { getAdminNotifications, getAdminStats } from "@/lib/data";

/**
 * Internal admin console shell. `requireAdmin()` re-verifies the role on the
 * server for every request — customers are redirected even if they somehow
 * bypass the edge middleware.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const [notifications, stats] = await Promise.all([
    getAdminNotifications(),
    getAdminStats(),
  ]);

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <div className="flex min-h-svh">
        <AdminSidebar pendingJobs={stats.pendingJobs} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            user={user}
            notifications={notifications}
            pendingJobs={stats.pendingJobs}
          />
          <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
