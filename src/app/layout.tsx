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
  title: "VocabBuilder - Complete Vocabulary Learning Platform",
  description: "Build and organize vocabulary across 11 languages. Upload custom Excel/CSV files, create sections, practice with multiple study modes. Hebrew, Arabic, Spanish, French, German and more.",
  keywords: ["vocabulary builder", "language learning", "custom vocabulary", "Excel upload", "vocabulary organizer", "Hebrew learning", "Arabic learning", "multilingual", "vocabulary management", "study modes"],
  authors: [{ name: "VocabBuilder" }],
  creator: "VocabBuilder",
  publisher: "VocabBuilder",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flashcardvocab.org',
    title: 'VocabBuilder - Complete Vocabulary Learning Platform',
    description: 'Build and organize vocabulary your way. Upload custom Excel/CSV files, create sections, and practice with multiple study modes across 11 languages.',
    siteName: 'VocabBuilder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VocabBuilder - Complete Vocabulary Learning Platform',
    description: 'Build and organize vocabulary across 11 languages. Upload custom content, create sections, and practice with multiple study modes.',
  },
  alternates: {
    canonical: 'https://flashcardvocab.org',
  },
  category: 'education',
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://flashcardvocab.org" />
        <meta name="google-site-verification" content="your-google-verification-code" />
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
