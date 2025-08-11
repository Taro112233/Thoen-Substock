// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // เอา experimental.nodeMiddleware ออก เพราะใช้ได้เฉพาะ canary version
  // ใช้ Edge Runtime ที่ตรวจสอบแค่ cookie แทน
  
  // การตั้งค่า TypeScript
  typescript: {
    // During builds, ignore TypeScript errors (ถ้าต้องการ)
    ignoreBuildErrors: false,
  },
  
  // การตั้งค่า environment variables
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // การตั้งค่า headers ปลอดภัย
  async headers() {
    return [
      {
        // ใช้กับทุก route
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // การตั้งค่า redirects สำหรับ routes เก่า (ถ้ามี)
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;