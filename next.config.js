/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a custom distDir to avoid OneDrive syncing locks on .next
  // Only use custom distDir in development, let Vercel use default
  ...(process.env.NODE_ENV === 'development' && { distDir: 'build' }),
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_USE_SUPABASE: process.env.NEXT_PUBLIC_USE_SUPABASE,
  }
}

module.exports = nextConfig