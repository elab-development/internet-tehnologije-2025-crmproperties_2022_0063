// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preusmeravanje sa "/" na login rutu.
  // Ovo znaci: kada otvoris http://localhost:3000/ automatski ide na /pages/auth/login
  async redirects() {
    return [
      {
        source: "/",
        destination: "/pages/auth",
        permanent: false, // false = privremeno (302), true = trajno (308)
      },
    ];
  },
};

export default nextConfig;
