import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Self-contained server (server.js) for the Node.js app on the shared hosting.
  output: "standalone",
  // No sharp / image optimisation server on shared hosting; images are already sized.
  images: { unoptimized: true },
  experimental: {
    // CSS arrives inside the HTML: no render-blocking stylesheet request on first visit (ad traffic).
    inlineCss: true,
  },
  // Long browser cache for brand files that rarely change.
  async headers() {
    return [
      { source: "/brand/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
      { source: "/og.jpg", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  // One address for search engines and ads: www.m04.shop redirects to m04.shop.
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "www.m04.shop" }], destination: "https://m04.shop/:path*", permanent: true }];
  },
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
