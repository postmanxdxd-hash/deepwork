import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Avoid WasmHash crash on Vercel Node 22 builds
    config.output.hashFunction = "xxhash64";
    return config;
  },
};

export default nextConfig;
