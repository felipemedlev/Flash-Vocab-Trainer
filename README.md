# Hebrew Flashcard Learning System

## Project Overview

This project is a comprehensive Hebrew flashcard learning application designed to help users study and master Hebrew vocabulary. It features user authentication, pre-loaded vocabulary sections, custom section creation via Excel uploads, and a smart learning algorithm to optimize study sessions. Built with Next.js 14+ using the App Router, Tailwind CSS, and SQLite3 database.

## Features

### Core Functionality
- **User Authentication**: Secure registration, login, session management, and user profile management. All user progress is tied to individual accounts.
- **Pre-loaded Content**: Includes default sections like "100 Most Used Words", "100 Most Used Verbs", "Family & Relationships", "Food & Cooking", "Travel & Transportation", and "Business & Work" with real Hebrew words and English translations.
- **Custom Section Upload (Excel)**: Allows users to upload `.xlsx` and `.xls` files to create custom vocabulary sections. Includes validation for file format (2 columns: "Hebrew", "English"), UTF-8 parsing, duplicate word handling, and file size limits.
- **Smart Learning Algorithm**: A sophisticated word frequency system that adapts to user performance.
    - Increases frequency significantly for incorrect answers, showing words more often until mastered.
    - Decreases frequency after correct answers, tracking consecutive correct attempts.
    - Words are considered "learned" after 3 correct answers across different study sessions, appearing less frequently for retention.
    - Supports manual marking of words as learned.
- **Study Interface**:
    - **Section Selection**: Grid/list view of sections with progress stats (X/Y words learned), distinguishing default/custom sections, and search/filter.
    - **Session Setup**: Users can select session length (10, 20, 50, custom) and focus on difficult words or a mix.
    - **Flashcard Interface**: Clean, centered design with prominent Hebrew word, proper RTL support, multiple-choice (10 English options + "I don't know"), smooth transitions, progress bar, and option to reveal answer.
    - **Answer Feedback**: Immediate visual feedback, shows correct answer, brief delay, and encouraging messages.
- **Progress Tracking & Analytics**:
    - **Dashboard**: Overall progress, words learned vs. total, daily/weekly study streaks, accuracy rates, improvement trends, and section-wise breakdown.
    - **Indicators**: Visual progress bars, color-coding for word difficulty (new, learning, mastered), and study session history.

### Completed Features
- **Project Setup & Database**: SQLite database setup, schema definition, and pre-loading script for default vocabulary.
- **User Authentication**: User registration, login, secure session management with NextAuth.js, and user profile management.
- **Core Learning Features**: Section selection, session setup, main flashcard study interface, and smart learning algorithm.
- **Content Management**: Excel upload feature for custom sections (frontend and backend API route created, `xlsx` library installed). File validation and error handling for uploads.
- **Analytics & User Experience**: User dashboard with progress tracking. Additional study modes and gamification elements implemented.

### Future Enhancements
- Ensure full responsive design and accessibility compliance.
- Conduct performance optimization and security hardening.
- Final testing and bug fixing.
- Implement additional study modes (English → Hebrew, Typing).
- Add gamification elements (streaks, achievements).
- Export/Import user progress as CSV and custom word sections.

## Technology Stack

- **Framework**: Next.js 14+ (with App Router)
- **Database**: SQLite3
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Excel Parsing**: `xlsx`
- **Package Manager**: pnpm (always used for dependency management)
- **Language**: TypeScript (recommended)

## Architecture

The application is built with Next.js 14+ using the App Router. The structure is as follows:

```
src/
├── app/
│   ├── api/             # Backend logic: authentication, database operations, file uploads
│   │   ├── auth/
│   │   ├── sections/
│   │   ├── words/
│   │   └── progress/
│   ├── dashboard/       # Feature-specific pages for user interface
│   ├── study/
│   ├── upload/
│   ├── auth/            # Frontend pages for user registration and login
│   └── ... (other pages like profile, sections)
├── components/          # Reusable React components (UI, flashcard, progress, layout)
│   ├── ui/
│   ├── flashcard/
│   ├── progress/
│   └── layout/
├── lib/                 # Core logic and utilities
│   ├── db/              # Shared Prisma client for database connections
│   ├── auth/
│   └── utils/
├── types/               # TypeScript type definitions
└── prisma/              # Manages database schema (schema.prisma), migrations, and seeding script (seed.ts)
```

## Setup and Installation

To get this project up and running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ulpanflashcards
    ```
2.  **Install dependencies:**
    This project uses `pnpm` as its package manager.
    ```bash
    pnpm install
    ```
3.  **Set up the database:**
    The project uses SQLite3 with Prisma.
    ```bash
    pnpm prisma migrate dev --name init
    pnpm prisma db seed
    ```
    This will create the `dev.db` file and pre-load default vocabulary.
4.  **Configure environment variables:**
    Create a `.env` file in the root directory and add necessary environment variables (e.g., `NEXTAUTH_SECRET`, `DATABASE_URL`).
5.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

After setting up the application, you can:
- Register and log in to your account.
- Explore pre-loaded Hebrew vocabulary sections.
- Upload your own custom vocabulary lists via Excel files.
- Start study sessions with the smart learning algorithm.
- Track your progress and analytics on the dashboard.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).