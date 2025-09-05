/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a custom distDir to avoid OneDrive syncing locks on .next
  distDir: 'build',
}

module.exports = nextConfig