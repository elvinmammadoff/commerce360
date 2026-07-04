import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The parent folder holds other projects with their own lockfiles —
  // pin the workspace root so Turbopack doesn't guess wrong.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
