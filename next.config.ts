import type { NextConfig } from "next";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins = config.plugins ?? [];
    config.plugins.push(new PrismaPlugin());
    return config;
  },
};

export default nextConfig;
