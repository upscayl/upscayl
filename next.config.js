/**
 * @type {import('next').NextConfig}
 **/

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    externalDir: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
