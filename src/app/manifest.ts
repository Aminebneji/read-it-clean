import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Read It Clean',
        short_name: 'RIC',
        description: 'Lisez mieux que sur Wowhead avec Read It Clean',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/RICLOGO.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
