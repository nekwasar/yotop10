import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "YoTop10 — Fact Mine. Debate Ground.",
  description:
    "A futuristic platform for top lists, debates, and facts. Argue, counter, and rank everything.",
  openGraph: {
    title: "YoTop10",
    description: "Fact Mine. Debate Ground. Your list vs the world.",
    url: "https://yotop10.com",
    siteName: "YoTop10",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>{children}</body>
    </html>
  );
}
