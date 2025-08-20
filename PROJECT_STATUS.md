# Project Status & Setup

## Project Overview

### Purpose and Scope
This project is a comprehensive Hebrew flashcard learning application designed to help users study and master Hebrew vocabulary. It features user authentication, pre-loaded vocabulary sections, custom section creation via Excel uploads, and a smart learning algorithm to optimize study sessions.

### Current Logic and Architecture
The application is built with Next.js 14+ using the App Router. The structure is as follows:

-   `src/app/`: Contains the application's pages and API routes.
    -   `api/`: Handles backend logic, including authentication (`auth`), database operations (`progress`, `sections`, `words`), and file uploads (`upload`).
    -   `auth/`: Frontend pages for user registration and login.
    -   `dashboard/`, `profile/`, `sections/`, `study/`, `upload/`: Feature-specific pages for the user interface.
-   `src/lib/`: Core logic and utilities.
    -   `db/`: Contains the shared Prisma client for database connections.
-   `src/components/`: Reusable React components.
-   `prisma/`: Manages the database schema (`schema.prisma`), migrations, and seeding script (`seed.ts`).

### Main Libraries and Tools
-   **Framework**: Next.js 14+ (with App Router)
-   **Database**: SQLite3
-   **ORM**: Prisma
-   **Authentication**: NextAuth.js
-   **Styling**: Tailwind CSS
-   **Excel Parsing**: `xlsx`

## Task Status

### Finished Tasks
-   **Phase 1: Project Setup & Database**
    -   Set up SQLite database and connection logic.
    -   Defined and created the database schema.
    -   Created a script to pre-load default vocabulary.
-   **Phase 2: User Authentication**
    -   Implemented user registration and login.
    -   Set up secure session management with NextAuth.js.
    -   Created user profile management pages.
-   **Phase 3: Core Learning Features**
    -   Developed the section selection screen with progress stats.
    -   Implemented the session setup interface.
    -   Built the main flashcard study interface.
    -   Implemented the smart learning algorithm for word frequency.
-   **Phase 5: Analytics & User Experience**
    -   Built the user dashboard with progress tracking.
-   **4.1: Create the Excel upload feature for custom sections.**
    -   The frontend upload page and the backend API route have been created. The `xlsx` library has been installed to handle file parsing.
-   **4.2:** Implement file validation and error handling for uploads.
-   **Phase 5.2: User Experience**
    -   Implement additional study modes.
    -   Add gamification elements.

### Remaining Tasks

-   **Phase 6: Finalization**
    -   Ensure full responsive design and accessibility.
    -   Conduct performance optimization and security hardening.
    -   Final testing and bug fixing.

## Development Notes
-   **Package Manager**: Always use `pnpm` for dependency management.
-   **File Size**: Keep all code files under 500 lines to maintain readability and modularity.