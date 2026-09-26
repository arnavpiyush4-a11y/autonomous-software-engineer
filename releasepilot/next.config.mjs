/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
