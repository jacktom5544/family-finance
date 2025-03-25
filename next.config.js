/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle fallbacks to ensure a page is always rendered
  async rewrites() {
    return [
      // Keep all normal routes intact
      {
        source: '/:path*',
        destination: '/:path*',
      },
      // Ensure test-page and alt-page are directly accessible
      {
        source: '/test-page',
        destination: '/test-page',
      },
      {
        source: '/alt-page',
        destination: '/alt-page',
      },
      // Handle 404 errors with static fallback
      {
        source: '/:path*',
        destination: '/',
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
  // Ensure proper page generation
  output: 'standalone',
  // Disable strict mode for easier development
  reactStrictMode: false,
  // Increase timeout for build
  staticPageGenerationTimeout: 180,
};

module.exports = nextConfig; 