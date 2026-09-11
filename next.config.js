/** @type {import('next').NextConfig} */
const nextConfig = {
  // Grava o commit do build no bundle como fallback de /api/version. O Vercel
  // já expõe VERCEL_GIT_COMMIT_SHA em runtime, mas isso garante que a rota
  // continue identificando o deploy mesmo se a env var mudar de escopo.
  env: {
    BUILD_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || '',
  },
};

export default nextConfig;
