import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css'
import '@mantine/core/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import AuthProvider from "@/components/auth-provider";
import { AppShellWrapper } from '@/components/AppShellWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hebrew Flashcard Learning System",
  description: "A comprehensive Hebrew flashcard learning application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MantineProvider>
          <AuthProvider>
            <AppShellWrapper>
              {children}
              <Analytics />
            </AppShellWrapper>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
