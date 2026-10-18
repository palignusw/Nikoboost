import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
    allowedDevOrigins: ["192.168.0.59"],
  
};



export default nextConfig;
