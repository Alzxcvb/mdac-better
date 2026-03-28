import withPWA from "@ducanh2912/next-pwa";

const nextConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
})({
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude playwright-core and @sparticuz/chromium from webpack bundling.
      // These are loaded at runtime in serverless functions, not bundled.
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "playwright-core",
        "@sparticuz/chromium",
      ];
    }
    return config;
  },
});

export default nextConfig;
