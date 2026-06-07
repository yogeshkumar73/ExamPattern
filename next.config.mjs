/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Prevent server-only packages from being bundled for the client
  serverExternalPackages: [
    'mongoose',
    'mongodb',
    'pdf-parse',
    'tesseract.js',
    'langchain',
    '@langchain/core',
    '@langchain/openai',
    'socket.io',
  ],
}

export default nextConfig
