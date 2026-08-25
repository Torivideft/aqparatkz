import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Увеличиваем лимит загрузки файлов до 10 МБ
    },
  },
};

export default nextConfig;
