import ClientWrapper from "@/components/ClientWrapper";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { UserProvider } from "@/contexts/UserContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import clsx from 'clsx';

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
    locale: 'pt-BR',
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

function NavbarWrapper() {
  return <Navbar />;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="h-full">
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          'antialiased flex flex-col min-h-screen bg-gray-100'
        )}
      >
        <UserProvider>
          <ClientWrapper>
            <div className="flex flex-col flex-grow min-h-screen">
              <NavbarWrapper />
              <main className="flex-grow w-full">
                {children}
              </main>
              <div className="mt-auto h-[106px]">
                <Footer />
              </div>
            </div>
          </ClientWrapper>
        </UserProvider>
      </body>
    </html>
  );
}
