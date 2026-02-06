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
      // Vietnamese news websites - VnExpress
      {
        protocol: 'https',
        hostname: '**.vnecdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vnexpress.net',
        pathname: '/**',
      },
      // Dân Trí
      {
        protocol: 'https',
        hostname: 'icdn.dantri.com.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dantri.com.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.dantri.com.vn',
        pathname: '/**',
      },
      // Tuổi Trẻ
      {
        protocol: 'https',
        hostname: 'cdn.tuoitre.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tuoitre.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.tuoitre.vn',
        pathname: '/**',
      },
      // Thanh Niên
      {
        protocol: 'https',
        hostname: 'cdn.thanhnien.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thanhnien.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.thanhnien.vn',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig

