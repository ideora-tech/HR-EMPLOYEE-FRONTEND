import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Diperlukan untuk Docker — menghasilkan server.js mandiri di .next/standalone
    output: 'standalone',
};

export default withNextIntl(nextConfig);
