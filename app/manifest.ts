import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpendWise Z',
    short_name: 'SpendWise',
    description: 'Survive the month on ₹10,000',
    start_url: '/',
    display: 'standalone',
    background_color: '#07080f',
    theme_color: '#8b5cf6',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
