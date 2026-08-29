/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.jp', 
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;