import type { NextConfig } from "next";
import { securityHeaders as sharedSecurityHeaders } from "./src/config/security-headers.mjs";
import extensionNetwork from "./src/portfolio/security.generated.json";

const isDevelopment = process.env.NODE_ENV !== "production";

const parsedBuildWorkers = Number.parseInt(
  process.env.NEXT_BUILD_WORKERS ?? "4",
  10,
);
const buildWorkers = Number.isFinite(parsedBuildWorkers)
  ? Math.max(1, Math.min(parsedBuildWorkers, 16))
  : 4;

const securityHeaders = sharedSecurityHeaders({
  development: isDevelopment,
  network: extensionNetwork as Record<string, string[]>,
});

/** Static hosts (npm run deploy -- firebase) get the site as files; their
 * own configuration serves the headers. */
const staticExport = process.env.FOLIO_HOSTING === "firebase";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Next 16 otherwise uses nearly every logical CPU for page-data generation.
    // A conservative default avoids native worker crashes on Windows/CI while
    // NEXT_BUILD_WORKERS keeps the setting portable for larger build hosts.
    cpus: buildWorkers,
  },
  ...(staticExport
    ? { output: "export", images: { unoptimized: true } }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: securityHeaders,
            },
          ];
        },
      }),
};

export default nextConfig;
