import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/events',
                destination: '/api/events',
            }
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'wow.zamimg.com',
            },
            {
                protocol: 'https',
                hostname: 'bnetcmsus-a.akamaihd.net',
            },
            {
                protocol: 'https',
                hostname: 'blz-contentstack-images.akamaized.net',
            },
        ],
    },
};

export default nextConfig;
