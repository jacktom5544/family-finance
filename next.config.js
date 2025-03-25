/** @type {import('next').NextConfig} */
const nextConfig = {
  // Specify both pages and app directory usage
  experimental: {
    appDir: true,
  },
  // Handle fallbacks to ensure a page is always rendered
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index',
      },
      {
        source: '/:path*',
        destination: '/:path*',
      },
      {
        source: '/:path*',
        destination: '/index',
        has: [
          {
            type: 'header',
            key: 'x-vercel-error',
          },
        ],
      },
    ];
  },
  // Add proper fallback behavior
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // Ensure static routing works properly
  trailingSlash: true,
  // Add output configuration
  output: 'standalone',
  // Disable strict mode for easier development
  reactStrictMode: false,
  // Increase timeout for build
  staticPageGenerationTimeout: 180,
};

module.exports = nextConfig; 