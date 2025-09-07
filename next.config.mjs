/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    suppressHydrationWarning: true,
  },
  i18n: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
    localeDetection: false,
  },
};

export default nextConfig;
