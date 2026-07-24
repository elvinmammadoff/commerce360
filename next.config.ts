import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The parent folder holds other projects with their own lockfiles —
  // pin the workspace root so Turbopack doesn't guess wrong.
  turbopack: {
    root: path.join(__dirname),
  },
  devIndicators: false,
  // Public share/embed viewers are unlisted-by-link — never index them.
  async headers() {
    return [
      {
        source: "/:group(view|embed)/:slug*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
