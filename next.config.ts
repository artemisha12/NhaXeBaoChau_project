import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ═══ Bảo mật: Tắt header X-Powered-By ═══
  // Không để lộ framework đang dùng
  poweredByHeader: false,

  // ═══ Security Headers bổ sung ═══
  async headers() {
    return [
      {
        // Áp dụng cho tất cả routes
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
      {
        // Cache dài hạn cho static assets (images)
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // KHÔNG cache admin pages — chống leak dữ liệu nhạy cảm
        source: '/admin/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

export default nextConfig;
