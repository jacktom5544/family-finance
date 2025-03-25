/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable rewrites to handle 404s
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
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