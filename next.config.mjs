/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    suppressHydrationWarning: true,
  },
  i18n: {
    locales: ['en', 'id'],
    defaultLocale: 'id',
    localeDetection: true,
  },
};

export default nextConfig;
