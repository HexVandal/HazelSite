import type { NextConfig } from "next";

const gloomApiOrigin = process.env.GLOOM_API_INTERNAL_URL || process.env.REALM_API_INTERNAL_URL || "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["3000-il432kur2xy1ttws8ktv2.e2b.app"],
  async rewrites() {
    return [{ source: "/gloom-api/:path*", destination: `${gloomApiOrigin}/:path*` }];
  },
  reactCompiler: true,
  experimental: {
    webpackMemoryOptimizations: true,
  },
  productionBrowserSourceMaps: false,
  // Ship the markdown files with the static blog routes.
  outputFileTracingIncludes: {
    "/blog": ["./content/blog/**/*"],
    "/blog/[slug]": ["./content/blog/**/*"],
    "/blog/[slug]/opengraph-image": ["./content/blog/**/*"],
  },
};

export default nextConfig;
