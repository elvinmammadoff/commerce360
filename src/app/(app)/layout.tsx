import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { getSessionUser } from "@/lib/auth";
import {
  getNotifications,
  getProducts,
  getWorkspace,
} from "@/lib/data";
import { SimulationProvider } from "@/lib/simulation/provider";
import { UserProvider } from "@/lib/user-context";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session-aware: staff browsing the customer app keep their admin identity
  // (and the "Admin console" shortcut in the account menu).
  const [user, workspace, notifications, products] = await Promise.all([
    getSessionUser(),
    getWorkspace(),
    getNotifications(),
    getProducts(),
  ]);

  return (
    <UserProvider initial={user}>
      <SimulationProvider initialCredits={workspace.creditsBalance} userId={user.id}>
        <a
          href="#main"
          className="sr-only rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
        >
          Skip to content
        </a>
        <div className="flex min-h-svh">
          <AppSidebar workspace={workspace} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppTopbar
              workspace={workspace}
              notifications={notifications}
              products={products}
            />
            <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </SimulationProvider>
    </UserProvider>
  );
}
