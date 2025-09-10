# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multilingual vocabulary trainer (flashcard learning platform) built with Next.js 15+ supporting 11 languages including Hebrew, Arabic, Spanish, French, German, Italian, Russian, Chinese, Portuguese, and Japanese. The application features user authentication, spaced repetition learning algorithms (SM-2), progress tracking, and custom vocabulary upload via Excel/CSV files.

## Essential Commands

### Development
```bash
pnpm dev                # Start development server with Turbopack
pnpm build             # Build for production (includes Prisma generate)
pnpm start             # Start production server
pnpm lint              # Run ESLint
```

### Database Management
```bash
pnpm prisma generate   # Generate Prisma client
pnpm prisma migrate deploy  # Apply database migrations
pnpm prisma db seed    # Seed database with default vocabulary
pnpm db:seed          # Alternative seed command using tsx
pnpm prisma studio    # Open Prisma Studio for database inspection
```

### Utilities
```bash
tsx [file.ts]         # Run TypeScript files directly
pnpm postinstall      # Automatically runs after package installation (generates Prisma)
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15+ with App Router and Turbopack
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with credentials provider
- **UI**: Mantine components + Tailwind CSS
- **Language**: TypeScript with path aliases (@/*)
- **Package Manager**: pnpm (required)

### Database Schema
Core entities: `User`, `Language`, `Section`, `Word`, `UserProgress`, `SessionHistory`
- Supports multilingual content with RTL language support
- Implements SM-2 spaced repetition algorithm fields
- User progress tracking per word with performance indexes
- Language-specific sections and vocabulary

### Key Architecture Patterns

#### Multilingual Support
- Language configuration in `src/config/languages.ts` defines 11 supported languages
- Each language has RTL support, custom fonts, and feature flags
- Database schema includes language-specific fields (`originalText`, `translationText`)

#### Learning Algorithm
- SM-2 spaced repetition implementation in `src/lib/sm2-algorithm.ts`
- Calculates optimal review intervals based on user performance
- Tracks easiness factor, repetition count, and next review dates

#### API Structure
```
src/app/api/
├── auth/              # NextAuth.js endpoints
├── sections/          # Vocabulary section management
├── words/             # Individual word operations
├── progress/          # User learning progress
├── sessions/          # Study session tracking
├── upload/            # Excel/CSV file processing
└── user-words-simple/ # Optimized word progress API
```

#### Component Organization
- `src/components/` contains reusable UI components
- `src/app/` follows Next.js App Router convention
- Authentication layout in `AuthLayout.tsx`
- Language-specific text rendering in `LanguageText.tsx`

### File Upload System
Supports Excel (.xlsx, .xls) and CSV uploads for custom vocabulary using the `xlsx` library. Files are validated for proper structure and duplicate detection.

## Development Guidelines

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name [migration_name]`
3. Update seed files if needed (`prisma/seed.ts`)

### Adding New Languages
1. Update `SUPPORTED_LANGUAGES` in `src/config/languages.ts`
2. Add font configurations and RTL support
3. Seed database with new language data
4. Update Tailwind config for language-specific fonts

### Authentication Flow
- Uses NextAuth.js v5 with JWT strategy
- Custom credentials provider with bcrypt password hashing
- Session management through `src/auth.ts`

### Spaced Repetition Integration
- All learning progress goes through SM-2 algorithm
- Quality ratings (0-5) determine next review intervals
- Progress tracking includes streak counting and performance analytics

## Project Structure Context

### Critical Configuration Files
- `prisma/schema.prisma` - Database schema with multilingual support
- `src/config/languages.ts` - Language definitions and features
- `src/auth.ts` - NextAuth.js configuration
- `src/lib/db/index.ts` - Prisma client with connection management

### Key Business Logic
- `src/lib/sm2-algorithm.ts` - Spaced repetition calculations
- `src/app/api/progress/route.ts` - Learning progress tracking
- `src/app/api/upload/route.ts` - File upload and parsing logic

### Language-Specific Features
The app handles RTL languages (Hebrew, Arabic) with proper text direction, custom fonts for different scripts (Cyrillic, CJK), and language-specific learning features (tones for Chinese, romanization, gender for European languages).

## Common Patterns

### API Route Structure
All API routes return JSON with consistent error handling and use Prisma for database operations.

### Component Patterns
- Language text uses `LanguageText` component for proper RTL/font handling
- Progress tracking components integrate with SM-2 algorithm
- All forms use Mantine components with TypeScript validation

### Database Queries
- Use Prisma's type-safe client with proper indexes
- Performance-optimized queries for learning progress
- Language-specific filtering in word queries