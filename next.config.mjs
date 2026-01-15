/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true, 
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;