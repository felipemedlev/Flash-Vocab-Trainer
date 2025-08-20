# Hebrew Flashcard Learning System - Complete Development Prompt

Build a comprehensive Hebrew flashcard learning application using Next.js 14+ with App Router, Tailwind CSS, and SQLite3 database.

Always keep files under 500 lines of code.
Always use pnpm, not npm.

## Core Requirements

### Technology Stack
- Next.js 14+ with App Router
- Tailwind CSS for styling
- SQLite3 database for data persistence
- Server Actions for database operations
- TypeScript (recommended for better development experience)

### User Authentication System
- User registration and login functionality
- Secure session management using cookies or JWT
- Password hashing and validation
- User profile management
- All user progress tied to individual accounts

### Database Schema Requirements

**Users Table:**
- id, username, email, password_hash, created_at, updated_at

**Sections Table:**
- id, name, description, is_default, created_by_user_id, created_at

**Words Table:**
- id, section_id, hebrew_text, english_translation, created_at

**User Progress Table:**
- id, user_id, word_id, correct_count, incorrect_count, consecutive_correct, last_seen, times_seen, is_manually_learned, created_at, updated_at

**Session History Table:**
- id, user_id, session_date, words_studied, correct_answers, session_length

### Pre-loaded Content System
Create default sections with actual Hebrew vocabulary:
- "100 Most Used Words"
- "100 Most Used Verbs"
- "Family & Relationships"
- "Food & Cooking"
- "Travel & Transportation"
- "Business & Work"

Each section should contain real Hebrew words with accurate English translations, properly formatted in Hebrew script with RTL support.

### Excel Upload Feature
- File upload component accepting .xlsx and .xls files
- Validate Excel format: exactly 2 columns with headers "Hebrew" and "English"
- Parse Hebrew text with proper UTF-8 encoding
- Create new custom sections from uploaded data
- Handle duplicate words gracefully
- File size limit validation (e.g., max 5MB)
- Error handling for malformed files

### Smart Learning Algorithm
Implement sophisticated word frequency system:

1. **Initial State**: All words start as "new" with neutral frequency
2. **Wrong Answer Logic**: 
   - Increase frequency significantly for incorrect answers
   - Track consecutive incorrect attempts
   - Words appear more frequently until answered correctly

3. **Correct Answer Logic**:
   - Decrease frequency after correct answers
   - Track consecutive correct answers
   - After 3 consecutive correct answers to a previously wrong word, reduce to normal frequency
   - Continue showing learned words occasionally for retention

4. **Mastery System**:
   - Word considered "learned" after 3 correct answers across different study sessions
   - Allow manual marking as learned
   - Learned words appear less frequently but still occasionally for retention

5. **Session Tracking**:
   - Track which words were seen in which sessions
   - Ensure "3 different sessions" requirement is properly validated

### Study Interface Requirements

**Section Selection Screen:**
- Grid or list view of available sections
- Show progress statistics for each section (X/Y words learned)
- Distinguish between default and custom sections
- Section search/filter functionality

**Session Setup:**
- Allow user to select session length (10, 20, 50, or custom number)
- Show estimated time based on selected length
- Option to focus on difficult words or mix of all words

**Flashcard Interface:**
- Clean, centered design with Hebrew word prominently displayed
- Proper RTL text support for Hebrew
- Multiple choice with 10 English options (9 random + 1 correct)
- "I don't know" button as 11th option
- Smooth animations for card transitions
- Progress bar showing session completion
- Option to reveal answer before selecting (for pure memorization mode)

**Answer Feedback:**
- Immediate visual feedback for correct/incorrect answers
- Show correct answer when wrong selection is made
- Brief delay before moving to next card
- Encouraging messages for progress milestones

### Progress Tracking & Analytics

**Dashboard Features:**
- Overall progress statistics
- Words learned vs. total words
- Daily/weekly study streaks
- Performance analytics (accuracy rates, improvement trends)
- Section-wise progress breakdown

**Progress Indicators:**
- Visual progress bars for each section
- Color coding for word difficulty levels (new, learning, mastered)
- Study session history with dates and performance

### User Experience Features

**Responsive Design:**
- Mobile-first approach with Tailwind CSS
- Touch-friendly interface for mobile devices
- Proper tablet and desktop layouts

**Accessibility:**
- Proper ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Hebrew font rendering optimization

**Performance:**
- Optimized database queries with proper indexing
- Client-side caching for frequently accessed data
- Lazy loading for large word lists
- Smooth animations without performance impact

### Additional Features

**Study Modes:**
- Standard multiple choice (primary mode)
- Hebrew → English (show Hebrew, select English)
- English → Hebrew (show English, select Hebrew)
- Typing mode (type the translation)

**Gamification Elements:**
- Daily study streaks
- Achievement badges for milestones
- Study time tracking
- Weekly/monthly challenges

**Export/Import:**
- Export user progress as CSV
- Export custom word sections
- Import progress from backups

## Technical Implementation Notes

### File Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── sections/
│   │   ├── words/
│   │   └── progress/
│   ├── dashboard/
│   ├── study/
│   ├── upload/
│   └── auth/
├── components/
│   ├── ui/
│   ├── flashcard/
│   ├── progress/
│   └── layout/
├── lib/
│   ├── db/
│   ├── auth/
│   └── utils/
└── types/
```

### Security Considerations
- Sanitize all user inputs
- Validate file uploads thoroughly
- Implement rate limiting for API endpoints
- Secure session management
- SQL injection prevention with prepared statements

### Performance Requirements
- Database queries should complete under 100ms
- Page transitions should be smooth (60fps)
- Excel file processing should show progress indicators
- Implement proper caching strategies

## Deliverables Expected

1. Complete Next.js application with all features implemented
2. Database schema with proper migrations
3. Comprehensive error handling and user feedback
4. Mobile-responsive design
5. Pre-loaded Hebrew vocabulary in multiple sections
6. Working Excel upload and parsing system
7. Fully functional smart learning algorithm
8. User authentication and progress persistence
9. Clean, intuitive user interface with Hebrew RTL support
10. Performance optimizations and security measures

Build this as a production-ready application that Hebrew learners would genuinely want to use for their studies.

# Hebrew Flashcard Learning System - Development Plan

Always keep files under 500 lines of code.
Always use pnpm, not npm.

## Phase 1: Project Setup & Database
- [ ] **1.1:** Set up SQLite database and connection logic.
- [ ] **1.2:** Define and create the database schema (Users, Sections, Words, User Progress, Session History).
- [ ] **1.3:** Create a script to pre-load the database with default Hebrew vocabulary sections.

## Phase 2: User Authentication
- [ ] **2.1:** Implement user registration and login functionality.
- [ ] **2.2:** Set up secure session management (cookies or JWT).
- [ ] **2.3:** Create user profile management pages.

## Phase 3: Core Learning Features
- [ ] **3.1:** Develop the section selection screen with progress stats.
- [ ] **3.2:** Implement the session setup interface.
- [ ] **3.3:** Build the main flashcard study interface with multiple-choice questions.
- [ ] **3.4:** Implement the smart learning algorithm for word frequency.

## Phase 4: Content Management
- [ ] **4.1:** Create the Excel upload feature for custom sections.
- [ ] **4.2:** Implement file validation and error handling for uploads.

## Phase 5: Analytics & User Experience
- [ ] **5.1:** Build the user dashboard with progress tracking and analytics.
- [ ] **5.2:** Implement additional study modes (English → Hebrew, Typing).
- [ ] **5.3:** Add gamification elements (streaks, achievements).

## Phase 6: Finalization
- [ ] **6.1:** Ensure full responsive design and accessibility compliance.
- [ ] **6.2:** Conduct performance optimization and security hardening.
- [ ] **6.3:** Final testing and bug fixing.