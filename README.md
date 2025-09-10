# 🌍 VocabBuilder - Complete Vocabulary Learning Platform

## Project Overview

A comprehensive **vocabulary learning and management platform** that goes beyond simple flashcards. VocabBuilder empowers users to build, organize, and study vocabulary across 11 languages with multiple study modes, intelligent spaced repetition, and powerful content creation tools. Built with cutting-edge technologies including Next.js 15+, TypeScript, PostgreSQL, and Prisma, this platform represents the future of personalized language learning.

**Supporting a truly global audience** with Hebrew, Arabic, Spanish, French, German, Italian, Russian, Chinese, Portuguese, Japanese, and English - complete with native RTL language support and language-specific optimizations.

## 🚀 Live Demo

Experience the platform firsthand:
[https://vocabbuilder.app/](https://vocabbuilder.app/)

Create custom vocabulary sections, upload Excel files, practice with multiple study modes, and track your learning progress across multiple languages.

## ✨ Key Features

### 🎯 **Complete Vocabulary Management System**
- **🌐 11 Language Support**: Hebrew, Arabic, Spanish, French, German, Italian, Russian, Chinese, Portuguese, Japanese, and English
- **📝 RTL Language Support**: Native right-to-left text rendering with proper typography
- **🎨 Language-Optimized Fonts**: Custom fonts and rendering for each script (Cyrillic, CJK, Arabic, etc.)
- **🔄 Flexible Study Modes**: Flashcards, word lists, practice modes, and progress tracking

### 🛡️ **Advanced User Management**
- **🔐 Secure Authentication**: NextAuth.js implementation with multiple authentication providers
- **👤 Comprehensive User Profiles**: Detailed progress tracking, learning statistics, and achievement systems
- **📊 Words Progress Dashboard**: New dedicated section showing learned vs. difficult words with advanced filtering
- **🎯 Personalized Learning**: Individual progress tracking per language with cross-language analytics

### 🧠 **Intelligent Learning System**
- **🎲 SM-2 Spaced Repetition Algorithm**: Advanced implementation of the SuperMemo SM-2 algorithm for optimal learning retention
- **📈 Adaptive Difficulty**: Dynamic word prioritization based on user performance and response times
- **🔄 Smart Review Scheduling**: Intelligent scheduling of word reviews based on forgetting curves
- **🎯 Performance Analytics**: Detailed accuracy tracking, response time analysis, and learning curve visualization

### 📚 **Powerful Content Creation Tools**
- **📁 Multiple Input Methods**: Manual entry, Excel/CSV upload, or copy-paste from spreadsheets
- **📊 File Upload Support**: .xlsx, .xls, and .csv files with intelligent parsing and validation
- **✅ Smart Data Processing**: Automatic duplicate removal, format validation, and error handling
- **🏷️ Organized Sections**: Create themed vocabulary collections with descriptions and difficulty levels
- **🔄 Demo Content**: Pre-loaded vocabulary sections (100+ words per language) to start learning immediately

### 🎮 **Multiple Study Modes**
- **⚡ Interactive Flashcards**: Modern, responsive flashcard interface with smooth animations and SM-2 algorithm
- **📋 Word List Practice**: Browse and study vocabulary in organized lists with filtering and search
- **⌨️ Keyboard Shortcuts**: Full keyboard navigation support for efficient studying
- **📱 Mobile-Optimized**: Fully responsive design optimized for mobile and tablet learning
- **⏱️ Flexible Sessions**: Customizable session lengths (10, 20, 50 words) or study entire sections

### 📊 **Comprehensive Analytics & Progress Tracking**
- **📈 Multi-Language Dashboard**: Overview of progress across all studied languages
- **🔥 Learning Streaks**: Daily and longest streak tracking with motivational elements
- **📊 Detailed Word Analytics**: Per-word statistics including accuracy, attempts, and mastery status
- **🎯 Performance Insights**: Learning velocity, retention rates, and improvement trends
- **📋 Words Progress Section**: New comprehensive view of learned words and words needing practice with advanced filtering

### 🔍 **Professional Features**
- **🔍 Advanced Search**: Search and filter words by original text, translation, or difficulty across all languages
- **📱 Progressive Web App**: Installable PWA for native app-like experience on mobile devices
- **🚀 Performance Optimized**: Lightning-fast API endpoints with intelligent caching and error recovery
- **🔄 Real-time Sync**: Live progress updates, session statistics, and cross-device synchronization
- **💾 Data Export**: Export your vocabulary and progress data for backup or analysis

## 🛠️ Technology Stack

This platform leverages cutting-edge technologies, demonstrating proficiency in modern full-stack development:

### **Frontend**
- **⚡ Next.js 15+** (App Router) - Latest React framework with server-side rendering
- **🎨 Mantine UI** - Modern React components library with excellent accessibility
- **💅 Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **🔷 TypeScript** - Enhanced code quality and developer experience

### **Backend**
- **🚀 Next.js API Routes** - Serverless API endpoints with built-in optimization
- **🐘 PostgreSQL** - Robust relational database with advanced querying capabilities
- **🔗 Prisma ORM** - Type-safe database client with excellent developer experience
- **🔐 NextAuth.js** - Comprehensive authentication solution

### **DevOps & Tools**
- **📦 pnpm** - Fast, disk space efficient package manager
- **🚀 Vercel** - Optimized deployment platform with edge functions
- **🔄 GitHub Actions** - Automated testing and deployment workflows

### **Advanced Libraries**
- **📊 xlsx** - Excel file parsing for custom vocabulary uploads
- **🧠 SM-2 Algorithm** - Custom implementation for spaced repetition
- **🌐 i18n Ready** - Internationalization support for future expansion

## 🏗️ Architecture

The application follows modern architectural principles with clear separation of concerns:

```
src/
├── app/
│   ├── api/                 # Backend API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── sections/       # Vocabulary section management
│   │   ├── words/          # Word and vocabulary operations
│   │   ├── progress/       # Learning progress and analytics
│   │   ├── sessions/       # Study session tracking
│   │   ├── user-words-simple/ # Optimized progress API
│   │   └── upload/         # File upload and processing
│   ├── dashboard/          # Multi-language progress dashboard
│   ├── profile/            # User profile and word progress
│   ├── study/              # Flashcard study interface
│   ├── learn/              # Language selection and content creation
│   ├── languages/          # Language selector with demo content
│   └── auth/               # Authentication pages
├── components/             # Reusable React components
│   ├── ui/                # UI components (FlashCard, LinearProgress)
│   └── layout/            # Layout components
├── lib/                   # Core application logic
│   ├── db.ts             # Database connection
│   ├── sm2-algorithm.ts  # Spaced repetition implementation
│   └── utils/            # Helper functions
├── config/               # Configuration files
│   └── languages.ts      # Supported languages configuration
└── prisma/               # Database schema and migrations
    ├── schema.prisma     # Database schema
    └── seed.ts          # Database seeding
```

## 🚀 Setup and Installation

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database
- Git

### **Local Development Setup**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vocabbuilder.git
   cd vocabbuilder
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/vocabbuilder"
   
   # Authentication
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optional: OAuth providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run database migrations
   pnpm prisma migrate deploy
   
   # Seed the database with default vocabulary
   pnpm prisma db seed
   ```

5. **Run the development server:**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to view the application.

### **Production Deployment**

The application is optimized for deployment on Vercel:

1. **Build the application:**
   ```bash
   pnpm build
   ```

2. **Run production server:**
   ```bash
   pnpm start
   ```

### **Available Scripts**

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
pnpm prisma:reset # Reset database and reseed
pnpm prisma:studio # Open Prisma Studio
```

## 📱 Usage Guide

### **Getting Started**
1. **Create Account**: Register with email or use the demo account
2. **Choose Language**: Select from 11 supported languages with 100+ words ready to study
3. **Immediate Learning**: Start with pre-loaded vocabulary sections like "Essential Greetings" and "100 Most Used Words"
4. **Create Custom Content**: Build your own vocabulary sections with manual entry or Excel/CSV upload
5. **Track Progress**: Monitor learning across multiple languages on the comprehensive dashboard

### **Key Workflows**

**📚 Building Custom Vocabulary:**
- Go to Language Sections → "Create Section"
- Choose between manual entry or file upload tabs
- Copy-paste directly from Excel or upload .xlsx/.csv files
- System automatically processes and validates your vocabulary

**🎯 Multiple Study Methods:**
- **Flashcards**: Spaced repetition with SM-2 algorithm
- **Word Lists**: Browse and practice vocabulary with filters
- **Progress Review**: Focus on difficult words or review mastered ones

**📊 Comprehensive Progress Tracking:**
- **Dashboard**: Overview of all languages and daily goals
- **Word Progress**: Detailed per-word analytics and difficulty tracking
- **Cross-Language**: Compare progress and learning velocity across languages

## 🌟 Technical Achievements

- **🏗️ Complete Vocabulary Platform**: Beyond flashcards - comprehensive vocabulary building, organization, and learning system
- **🧠 Intelligent Learning System**: Custom SM-2 spaced repetition with adaptive difficulty and performance optimization
- **🌍 True Multilingual Support**: 11 languages with native RTL support, language-specific fonts, and cultural context
- **📊 Sophisticated Content Management**: Multiple input methods (manual, upload, copy-paste) with intelligent processing
- **🚀 Performance Excellence**: Optimized APIs, real-time updates, and mobile-first responsive design
- **🎨 Professional UX**: Intuitive interface that scales from beginner to power user workflows
- **📱 Cross-Platform Compatibility**: PWA with native app experience across desktop and mobile

## 🎯 Target Audience

**Built for serious language learners worldwide**, serving:
- **Professionals** building vocabulary for career advancement
- **Students** organizing and memorizing academic vocabulary
- **Language enthusiasts** studying multiple languages simultaneously  
- **Educational institutions** needing scalable vocabulary management
- **Content creators** building custom learning materials for their communities

## 🔮 Future Roadmap

- **🤖 AI-Powered Features**: Intelligent vocabulary suggestions, automated content generation, and personalized learning paths
- **🔊 Audio Integration**: Native pronunciation support, listening exercises, and speech recognition
- **👥 Collaborative Learning**: Study groups, shared vocabulary collections, and community-generated content
- **🎮 Advanced Gamification**: Achievement systems, streaks, leaderboards, and vocabulary challenges
- **📊 ML Analytics**: Pattern recognition for learning optimization and predictive difficulty assessment
- **🌐 Extended Language Support**: Additional languages and dialect variations based on community demand
- **🔄 Advanced Import/Export**: Support for Anki decks, Quizlet sets, and other popular vocabulary formats

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and feel free to submit issues or pull requests.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for serious language learners everywhere**

*VocabBuilder represents the evolution from simple flashcard tools to comprehensive vocabulary management platforms - empowering users to truly build their vocabulary their way.*