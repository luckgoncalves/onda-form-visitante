import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import type { Viewport } from 'next'

const inter = Inter({ subsets: ["latin"] });

const gothamBold = localFont({
  src: [
    {
      path: "../fonts/Gotham-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Gotham-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gotham-bold",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Onda Dura",
  description: "App Onda Dura",
  icons: {
    icon: [
      { url: '/favicon-od.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon-od.ico' },
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
      <body className={`${inter.className} ${gothamBold.variable} h-[100%]  min-h-screen  bg-white`}>
        {children}
      </body>
    </html>
  );
}
