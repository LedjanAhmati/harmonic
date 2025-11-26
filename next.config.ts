import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: path.join(__dirname),
  },
  // UTF-8 Encoding Support for Unicode symbols
  env: {},
  output: 'standalone',
  compress: false,
  poweredByHeader: false,
  experimental: {
    forceSwcTransforms: true,
  }
};

export default nextConfig;
