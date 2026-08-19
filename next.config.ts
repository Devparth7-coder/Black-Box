import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Arena's preview sandbox (which proxies via *.e2b.app) to load dev resources.
  allowedDevOrigins: [".e2b.app"],
};

export default nextConfig;
