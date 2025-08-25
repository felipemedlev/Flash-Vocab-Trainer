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
  title: "Flash Vocab Trainer - Multilingual Flashcard Learning Platform",
  description: "Master 11 languages with AI-powered spaced repetition flashcards. Learn Hebrew, Arabic, Spanish, French, German and more. Free vocabulary trainer with progress tracking.",
  keywords: ["language learning", "flashcards", "vocabulary trainer", "spaced repetition", "Hebrew learning", "Arabic learning", "multilingual", "AI-powered learning", "vocabulary builder"],
  authors: [{ name: "Flash Vocab Trainer" }],
  creator: "Flash Vocab Trainer",
  publisher: "Flash Vocab Trainer",
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
    title: 'Flash Vocab Trainer - Master Languages with Smart Flashcards',
    description: 'Transform your language learning with AI-powered spaced repetition. Support for 11 languages including Hebrew, Arabic, Spanish, French, German and more.',
    siteName: 'Flash Vocab Trainer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flash Vocab Trainer - Multilingual Learning Platform',
    description: 'Master 11 languages with AI-powered spaced repetition flashcards. Free vocabulary trainer with progress tracking.',
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
