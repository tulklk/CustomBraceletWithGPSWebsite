/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '/**',
      },
      // Vietnamese news websites
      {
        protocol: 'https',
        hostname: '**.vnecdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'icdn.dantri.com.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.tuoitre.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.thanhnien.vn',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig

