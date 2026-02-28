import type { Metadata } from "next";
import { Roboto, Monoton, Anton } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { ThemeLayoutWrapper } from "@/components/layout/theme-layout-wrapper";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

const monoton = Monoton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo-yo",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo-top10",
});

export const metadata: Metadata = {
  title: "YoTop10 — Fact Mine. Debate Ground.",
  description: "A futuristic platform for top lists, debates, and facts. Argue, counter, and rank everything.",
  openGraph: {
    title: "YoTop10",
    description: "Fact Mine. Debate Ground.",
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
      <body className={`${roboto.variable} ${monoton.variable} ${anton.variable} bg-[var(--bg-base)] text-[var(--text-primary)] antialiased transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>
            <ThemeLayoutWrapper>
              {children}
            </ThemeLayoutWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
