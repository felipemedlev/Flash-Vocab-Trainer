import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flash Vocab Trainer - Multilingual Learning Platform',
    short_name: 'Flash Vocab Trainer',
    description: 'Master 11 languages with AI-powered spaced repetition flashcards. Learn Hebrew, Arabic, Spanish, French, German and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3B82F6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['education', 'productivity'],
    lang: 'en-US',
    dir: 'ltr',
  }
}