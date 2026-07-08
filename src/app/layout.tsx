import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import type { Viewport } from 'next'
import { PWARegister } from "@/components/pwa-register";
import { PersistentHeader } from "@/components/persistent-header";
import { Toaster } from "@/components/ui/toaster";

const gothamBold = localFont({
  src: [
    {
      path: "../fonts/Gotham-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gotham-bold",
  fallback: ["Arial", "sans-serif"],
});

const rightGrotesk = localFont({
  src: [
    {
      path: "../fonts/RightGrotesk-TightDark.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/RightGrotesk-CompactBlack.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-right-grotesk",
  fallback: ["Arial", "sans-serif"],
});

const spaceGrotesk = localFont({
  src: [
    {
      path: "../fonts/SpaceGrotesk-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/SpaceGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SpaceGrotesk-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SpaceGrotesk-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SpaceGrotesk-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-space-grotesk",
  fallback: ["Arial", "sans-serif"],
});

const sfProDisplay = localFont({
  src: [
    {
      path: "../fonts/SF-Pro-Display-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-display",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Igreja Onda",
  description: "App Igreja Onda",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  manifest: '/site.webmanifest',
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
        <meta name="theme-color" content="#11187e" />
      </head>
      <body className={`${spaceGrotesk.variable} ${gothamBold.variable} ${rightGrotesk.variable} ${sfProDisplay.variable} font-sans h-[100%] min-h-screen bg-white`}>
        <PWARegister />
        <PersistentHeader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
