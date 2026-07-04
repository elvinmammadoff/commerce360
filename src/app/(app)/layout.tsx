import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import {
  getCurrentUser,
  getNotifications,
  getProducts,
  getWorkspace,
} from "@/lib/data";
import { SimulationProvider } from "@/lib/simulation/provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, workspace, notifications, products] = await Promise.all([
    getCurrentUser(),
    getWorkspace(),
    getNotifications(),
    getProducts(),
  ]);

  return (
    <SimulationProvider initialCredits={workspace.creditsBalance}>
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
            user={user}
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
  );
}
