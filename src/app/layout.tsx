import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Viewport } from 'next'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OD - Visitantes",
  description: "Ficha de visitantes Onda Dura",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  maximumScale: 1,
  viewportFit: 'cover',

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} h-[100%]  min-h-screen  bg-gradient-to-r from-[#9562DC] to-[#FEF057]`}>
        {children}
      </body>
    </html>
  );
}
