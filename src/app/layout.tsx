import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OD - Visitantes",
  description: "Ficha de visitantes Onda Dura",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-[100%]  min-h-screen  bg-gradient-to-r from-[#9562DC] to-[#FEF057]`}>{children}</body>
    </html>
  );
}
