// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  output: undefined,
  trailingSlash: true,
  images: {
    qualities: [75, 100],
  },
};

export default nextConfig;