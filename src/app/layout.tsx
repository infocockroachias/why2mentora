import type { Metadata, Viewport } from "next";
import { Fraunces, Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MENTORA IAS — Instant AI answers, verified mentors for UPSC & PCS",
  description:
    "MENTORA IAS pairs a free, instant AI explanation with verified human mentors — rankers, professors and practitioners — so no aspirant ever stays stuck on a doubt. Pay only when you mark it solved.",
  keywords: [
    "MENTORA IAS",
    "UPSC",
    "IAS",
    "State PCS",
    "SSC",
    "RBI Grade B",
    "doubt solving",
    "AI tutor",
    "mentors",
  ],
  authors: [{ name: "MENTORA IAS" }],
  openGraph: {
    title: "MENTORA IAS — Bring the doubt. Leave with clarity.",
    description:
      "Free AI answers in seconds, verified mentors when it matters. Built for UPSC & PCS aspirants.",
    siteName: "MENTORA IAS",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#14532d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${fraunces.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
