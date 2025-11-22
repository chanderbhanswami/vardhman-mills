/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict route typing to fix routing errors
  typedRoutes: false,
  // Set turbopack root to fix lockfile warning  
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Allow local images
    domains: ['localhost'],
    // Disable image optimization for local development if causing issues
    unoptimized: process.env.NODE_ENV === 'development',
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

module.exports = nextConfig;