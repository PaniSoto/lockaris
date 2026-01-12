/** @type {import('next').NextConfig} */

const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [new URL('https://res.cloudinary.com/jamj2000/image/upload/**')],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
