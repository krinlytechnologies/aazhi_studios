import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Cache Components / Partial Prefetching are server-runtime features for
  // hybrid static+dynamic apps — this site has no dynamic routes (confirmed:
  // no headers()/cookies()/searchParams/route handlers anywhere), and both
  // are flatly incompatible with `output: "export"` (Next.js throws "PPR
  // cannot be enabled in export mode" otherwise), which static Cloudflare
  // Pages hosting requires.
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
