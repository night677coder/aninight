const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  // disable:false,
  workboxOptions: {
    disableDevLogs: true,
  },
  // ... other options you like
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['s4.anilist.co','artworks.thetvdb.com','media.kitsu.io', 'image.tmdb.org', 'mangapill.com', 'cdn.mangapill.com'],
        unoptimized: true,
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**.mangapill.com',
          },
          {
            protocol: 'https',
            hostname: 'consumet-six-alpha.vercel.app',
          },
        ],
      },
      async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
    },
    // Show detailed error messages in production
    reactStrictMode: true,
    productionBrowserSourceMaps: true,
    // Webpack configuration to handle Consumet library
    webpack: (config, { isServer }) => {
      // Exclude problematic packages from webpack processing
      config.externals = config.externals || [];
      
      if (isServer) {
        // Mark these as external for server-side to avoid webpack processing
        config.externals.push({
          'undici': 'commonjs undici',
          'cheerio': 'commonjs cheerio',
        });
      }
      
      // Handle ES modules properly
      config.module.rules.push({
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      });
      
      // Ignore node_modules warnings for private class fields
      config.ignoreWarnings = [
        { module: /node_modules\/undici/ },
        { module: /node_modules\/cheerio/ },
      ];
      
      return config;
    },
    // Transpile specific packages that use modern syntax
    transpilePackages: ['@consumet/extensions'],
  }
  
module.exports = withPWA(nextConfig);
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })
// module.exports = withBundleAnalyzer(nextConfig)
