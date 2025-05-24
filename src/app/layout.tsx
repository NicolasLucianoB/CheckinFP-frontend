'use client';

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
              <main className="flex-grow">
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
