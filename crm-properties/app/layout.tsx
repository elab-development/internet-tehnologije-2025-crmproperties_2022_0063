// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import NavigationMenu from "@/src/client/components/NavigationMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Properties",
  description: "Manage your properties efficiently with CRM Properties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "antialiased",
          "bg-[#0b0b10] text-white",
          "relative min-h-screen",
        ].join(" ")}
      >
        {/* Globalna pozadina za sve stranice. */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-black via-[#0b0b10] to-[#0f1020]" />

        {/* Navigacija se sama sakriva na /pages/auth. */}
        <NavigationMenu />

        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
