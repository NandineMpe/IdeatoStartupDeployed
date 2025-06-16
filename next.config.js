/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Required for Clerk to work properly
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'cvjdrblhcif4qupj.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'adtmi1hoep2dtmuq.public.blob.vercel-storage.com',
      },
    ],
  },
  
  // Environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  },

  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
}

module.exports = nextConfig
