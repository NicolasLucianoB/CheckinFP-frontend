import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkin-FP',
  description: 'Sistema de check-in para voluntários do ministério de Mídia da Família Plena',

  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  },

  openGraph: {
    title: 'Checkin-FP',
    description: 'Sistema de check-in para voluntários do ministério de Mídia da Família Plena',
    url: 'https://checkin-fp-frontend.vercel.app',
    siteName: 'Checkin-FP',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://checkin-fp-frontend.vercel.app/assets/open-graph-image.png',
        width: 1200,
        height: 630,
        alt: 'Capa do Checkin-FP',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Checkin-FP',
    description: 'Sistema de check-in para voluntários do ministério de Mídia da Família Plena',
    images: ['https://checkin-fp-frontend.vercel.app/assets/open-graph-image.png'],
  },
};