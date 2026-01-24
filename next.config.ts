import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Allow Unsplash and Pravatar avatars used in mock data
    domains: ['images.unsplash.com', 'i.pravatar.cc'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
