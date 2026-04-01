/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  staticPageGenerationTimeout: 0,
  experimental: {
    dynamicIO: true,
  },
}

export default nextConfig
