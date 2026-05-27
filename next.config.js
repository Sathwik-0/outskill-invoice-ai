/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
};

module.exports = nextConfig;
