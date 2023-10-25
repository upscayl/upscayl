/**
 * @type {import('next').NextConfig}
 **/

const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
