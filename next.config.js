/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['s4.anilist.co','artworks.thetvdb.com','media.kitsu.io', 'image.tmdb.org', 'mangapill.com', 'cdn.mangapill.com'],
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
                    // Security Headers
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
                ]
            },
            {
                source: '/(.*)',
                headers: [
                    // Content Security Policy
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://www.youtube.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https: https://i.ytimg.com https://s4.anilist.co https://images.unsplash.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com; media-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; worker-src 'self'; manifest-src 'self'; upgrade-insecure-requests"
                    },
                    // Security Headers
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
                    // Performance Headers
                    { key: "X-DNS-Prefetch-Control", value: "on" },
                    { key: "X-Download-Options", value: "noopen" },
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
    productionBrowserSourceMaps: false, // Changed to false for security
    poweredByHeader: false,
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
  
module.exports = nextConfig;
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })
// module.exports = withBundleAnalyzer(nextConfig)
