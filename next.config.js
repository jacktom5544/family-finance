/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper page generation
  output: 'standalone',
  // Disable strict mode for easier development
  reactStrictMode: false,
  // Increase timeout for build
  staticPageGenerationTimeout: 180,
  // Force clear cache on build
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Custom headers to prevent caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
  // Handle any paths that need special consideration
  async redirects() {
    return [];
  },
};

module.exports = nextConfig; 