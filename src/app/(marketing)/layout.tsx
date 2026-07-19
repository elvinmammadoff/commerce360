import { cookies } from "next/headers";
import { Atmosphere } from "@/components/marketing/atmosphere";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { getCurrentUser } from "@/lib/data";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const isLoggedIn = !!store.get("c360-token")?.value;

  const user = isLoggedIn
    ? await getCurrentUser().catch(() => null)
    : null;

  return (
    <>
      <a
        href="#content"
        className="sr-only rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60]"
      >
        Skip to content
      </a>
      <Atmosphere />
      <MarketingNavbar isLoggedIn={isLoggedIn} user={user} />
      <main id="content" className="relative overflow-x-clip">
        {children}
      </main>
      <MarketingFooter />
    </>
  );
}
