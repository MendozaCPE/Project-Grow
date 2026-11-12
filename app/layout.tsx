import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Project GROW - LAC Form 4",
  description: "Learning Action Cell Form 4 Management for DepEd Teachers",
  manifest: "/manifest.json",
  themeColor: "#E3B23C",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Project GROW",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#E3B23C",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force dynamic rendering - required for cookies() in Header
  await connection();
  
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
