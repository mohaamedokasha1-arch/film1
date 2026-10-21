import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
  },
  eslint: { ignoreDuringBuilds: true },
  // Allow the Arena preview host to load dev assets safely.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
  images: {
    // TMDB serves posters from its CDN. We keep `next/image` remote patterns
    // configured for teams that enable Vercel image optimisation, and default to
    // `unoptimized` so images keep working on any host without extra billing.
    unoptimized: process.env.NEXT_IMAGE_OPTIMIZATION !== "1",
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "media.themoviedb.org" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
