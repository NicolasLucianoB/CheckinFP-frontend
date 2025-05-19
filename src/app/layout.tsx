'use client';

import ClientWrapper from "@/components/ClientWrapper";
import Footer from "@/components/Footer";
import { UserProvider } from "@/contexts/UserContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ClientWrapper>
          <div className="flex flex-col flex-grow min-h-screen">
            <UserProvider>
              <main className="flex-grow">
                <>
                  {children}
                </>
              </main>
            </UserProvider>
            <div className="mt-auto h-[106px]">
              <Footer />
            </div>
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}
