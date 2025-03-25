/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper page generation
  output: 'standalone',
  // Disable strict mode for easier development
  reactStrictMode: false,
  // Increase timeout for build
  staticPageGenerationTimeout: 180,
  // Handle any paths that need special consideration
  async redirects() {
    return [];
  },
};

module.exports = nextConfig; 