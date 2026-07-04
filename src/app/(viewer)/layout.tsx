import { getWorkspace } from "@/lib/data";
import { SimulationProvider } from "@/lib/simulation/provider";

/**
 * Chrome-free layout for the immersive fullscreen viewer. Still wraps the
 * simulation store so freshly generated demo products resolve here too.
 */
export default async function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getWorkspace();
  return (
    <SimulationProvider initialCredits={workspace.creditsBalance}>
      {children}
    </SimulationProvider>
  );
}
