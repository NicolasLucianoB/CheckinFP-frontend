export const metadata = {
  metadataBase: new URL('https://checkin-fp-frontend.vercel.app'),
  title: 'CheckinFP',
  description: 'Sistema de check-in para voluntários do ministério de Mídia da Família Plena',
  icons: {
    icon: [
      { url: '/assets/logo.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'CheckinFP',
    description: 'Sistema de check-in para voluntários do ministério de Mídia da Família Plena',
    url: 'https://checkin-fp-frontend.vercel.app',
    siteName: 'CheckinFP',
    images: [
      {
        url: 'https://checkin-fp-frontend.vercel.app/assets/open-graph-image.png',
        width: 1200,
        height: 630,
        alt: 'Capa do Checkin-FP',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

import ClientWrapper from "@/components/ClientWrapper";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { UserProvider } from "@/contexts/UserContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import clsx from 'clsx';

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
