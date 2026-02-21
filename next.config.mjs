// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  output: 'export',       // wajib biar next export jalan
  trailingSlash: true     // optional, biar URL /about/ bukan /about.html
};

// ESM export
export default nextConfig;