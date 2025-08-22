# Hebrew Flashcard Learning System

## Project Overview

This project showcases a sophisticated Hebrew flashcard learning platform, meticulously engineered to facilitate efficient vocabulary acquisition. It integrates robust user authentication, dynamic content management including custom vocabulary uploads via Excel, and an adaptive smart learning algorithm. Developed with cutting-edge technologies like Next.js 14+ (App Router), Tailwind CSS, and PostgreSQL, this application demonstrates expertise in full-stack development, scalable architecture, and intuitive user experience design.

## Live Demo

Experience the platform firsthand:
[https://flash-vocab-trainer.vercel.app/](https://flash-vocab-trainer.vercel.app/)

Explore the intuitive interface, test the smart learning algorithm, and see the custom upload feature in action.

## Features

### Core Functionality
- **Robust User Authentication**: Implemented secure user registration, login, and session management using NextAuth.js, ensuring all user progress and data are securely tied to individual accounts.
- **Dynamic Content Management**: Provided a rich set of pre-loaded vocabulary sections and enabled users to create custom sections by uploading `.xlsx` and `.xls` files. This feature includes comprehensive server-side validation for file format (enforcing "Hebrew", "English" columns), efficient UTF-8 parsing, intelligent duplicate word handling, and file size constraints.
- **Adaptive Smart Learning Algorithm**: Developed a sophisticated, performance-driven word frequency system that dynamically adjusts to user interactions.
    - **Intelligent Spaced Repetition**: Significantly increases the frequency of incorrectly answered words, ensuring repeated exposure until mastery.
    - **Reinforced Learning**: Decreases word frequency after correct answers, tracking consecutive successful attempts to optimize retention.
    - **Mastery Recognition**: Words are marked as "learned" after 3 correct answers across distinct study sessions, reducing their appearance for long-term retention.
    - **User Control**: Allows manual marking of words as learned, providing flexibility in the learning process.
- **Intuitive Study Interface**: Engineered a highly responsive and user-friendly study environment.
    - **Flexible Section Selection**: Features a dynamic grid/list view of vocabulary sections, displaying real-time progress statistics (X/Y words learned), clear distinction between default and custom content, and robust search/filter capabilities.
    - **Customizable Session Setup**: Empowers users to tailor study sessions by selecting lengths (10, 20, 50, custom) and focusing on challenging words or a balanced mix.
    - **Engaging Flashcard Experience**: Designed a clean, centered flashcard interface with prominent Hebrew word display, full Right-to-Left (RTL) language support, dynamic multiple-choice options (10 English translations + "I don't know"), smooth transitions, an interactive progress bar, and an option to reveal answers.
    - **Instant Feedback System**: Delivers immediate visual feedback, displays correct answers, incorporates a brief delay for processing, and provides encouraging messages to enhance the learning loop.
- **Comprehensive Progress Tracking & Analytics**: Integrated a powerful analytics dashboard to provide users with deep insights into their learning journey.
    - **Performance Dashboard**: Offers an overview of overall progress, words learned vs. total, daily/weekly study streaks, accuracy rates, improvement trends, and detailed section-wise breakdowns.
    - **Visual Progress Indicators**: Utilizes visual progress bars and color-coding to represent word difficulty (new, learning, mastered), alongside a detailed study session history.

### Completed Features
- **Project Setup & Database**: PostgreSQL database setup, schema definition, and pre-loading script for default vocabulary.
- **User Authentication**: User registration, login, secure session management with NextAuth.js, and user profile management.
- **Core Learning Features**: Section selection, session setup, main flashcard study interface, and smart learning algorithm.
- **Content Management**: Excel upload feature for custom sections (frontend and backend API route created, `xlsx` library installed). File validation and error handling for uploads.
- **Analytics & User Experience**: User dashboard with progress tracking. Additional study modes and gamification elements implemented.

### Key Achievements & Impact
- **Full-Stack Development**: Successfully designed, developed, and deployed a complete full-stack application, demonstrating end-to-end ownership from database schema to user interface.
- **Complex Algorithm Implementation**: Engineered and integrated a sophisticated Spaced Repetition System (SM-2 variant) to optimize learning efficiency and retention, showcasing strong algorithmic thinking and problem-solving skills.
- **Scalable Data Handling**: Implemented robust data management for user-generated content, including secure Excel file uploads with comprehensive validation and efficient parsing for custom vocabulary sections.
- **Modern Tech Stack Proficiency**: Gained hands-on expertise with Next.js 14+ (App Router), PostgreSQL, Prisma, NextAuth.js, and Tailwind CSS, applying best practices in each technology.
- **User-Centric Design**: Focused on creating an intuitive and engaging user experience, from customizable study sessions to detailed progress analytics, enhancing user satisfaction and learning outcomes.

### Future Enhancements
- **Responsive Design & Accessibility**: Committed to ensuring full responsive design across all devices and achieving WCAG 2.1 AA accessibility compliance.
- **Performance & Security**: Ongoing focus on performance optimization, including code splitting, lazy loading, and API response caching, alongside continuous security hardening measures.
- **Robustness & Reliability**: Dedicated to thorough final testing, comprehensive bug fixing, and continuous integration/continuous deployment (CI/CD) pipeline enhancements.
- **Advanced Study Modes**: Plan to implement additional study modes, including English → Hebrew translation and typing exercises, to cater to diverse learning preferences.
- **Gamification & Engagement**: Future plans include integrating gamification elements such as streaks and achievements to enhance user engagement and motivation.
- **Data Portability**: Envisioning features for exporting and importing user progress as CSV and custom word sections, providing users with greater control over their data.

## Technology Stack

This project leverages a modern and robust technology stack, demonstrating proficiency in full-stack development and scalable application design:

- **Framework**: Next.js 14+ (with App Router) - Utilized for building a high-performance, SEO-friendly React application with server-side rendering and API routes.
- **Database**: PostgreSQL - Chosen for its reliability, data integrity, and advanced querying capabilities to manage complex vocabulary and user progress data.
- **ORM**: Prisma - Employed as a next-generation ORM for type-safe database access, simplifying database interactions and schema management.
- **Authentication**: NextAuth.js - Integrated for secure and flexible authentication, supporting various providers and robust session management.
- **Styling**: Tailwind CSS - Used for rapid UI development and consistent, utility-first styling, ensuring a responsive and modern design.
- **Excel Parsing**: `xlsx` - Implemented for efficient and reliable parsing of Excel files, enabling custom vocabulary uploads.
- **Package Manager**: pnpm - Standardized for efficient dependency management, optimizing installation times and disk space usage.
- **Language**: TypeScript - Adopted for enhanced code quality, maintainability, and developer experience through static typing.

## Architecture

The application is architected on Next.js 14+ with the App Router, promoting a clear separation of concerns and a scalable structure. Key architectural highlights include:

- **Modular Design**: Organized into distinct `app/`, `components/`, `lib/`, `types/`, and `prisma/` directories for maintainability and scalability.
- **API Routes**: `src/app/api/` houses backend logic for authentication, database operations, and file uploads, ensuring a clean and efficient API layer.
- **Feature-Driven Frontend**: `src/app/` contains feature-specific pages (e.g., `dashboard/`, `study/`, `upload/`, `auth/`) for a well-structured user interface.
- **Reusable Components**: `src/components/` centralizes reusable React components for UI elements, flashcards, progress indicators, and layout, fostering consistency and development efficiency.
- **Core Logic & Utilities**: `src/lib/` encapsulates core application logic, including a shared Prisma client for robust database connections, authentication utilities, and general helper functions.
- **Type Safety**: `src/types/` defines TypeScript type definitions across the application, enhancing code reliability and developer experience.
- **Database Management**: `prisma/` manages the database schema (`schema.prisma`), migrations, and seeding scripts (`seed.ts`), ensuring version-controlled and consistent database evolution.

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
    The project uses PostgreSQL with Prisma.
    ```bash
    pnpm prisma migrate deploy
    pnpm prisma db seed
    ```
    This will set up the database schema and pre-load default vocabulary.
4.  **Configure environment variables:**
    Create a `.env` file in the root directory. You will need to set the `DATABASE_URL` environment variable to your PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database?schema=public`). Also, add other necessary environment variables (e.g., `NEXTAUTH_SECRET`).
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