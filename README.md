# 🌍 Multilingual Vocabulary Trainer

## Project Overview

A sophisticated **multilingual flashcard learning platform** designed for efficient vocabulary acquisition across multiple languages. This application integrates robust user authentication, dynamic content management, intelligent spaced repetition algorithms, and comprehensive progress tracking. Built with modern technologies including Next.js 15+, TypeScript, PostgreSQL, and Prisma, this platform demonstrates expertise in full-stack development, scalable architecture, and exceptional user experience design.

**Specifically designed for the diverse linguistic landscape of Tel Aviv**, supporting Hebrew, Arabic, English, Spanish, French, German, Italian, Russian, Chinese, Portuguese, and Japanese with full RTL language support.

## 🚀 Live Demo

Experience the platform firsthand:
[https://flash-vocab-trainer.vercel.app/](https://flash-vocab-trainer.vercel.app/)

Test the multilingual interface, explore the intelligent learning algorithms, and experience the comprehensive progress tracking system.

## ✨ Key Features

### 🎯 **Core Multilingual Functionality**
- **🌐 Multi-Language Support**: Full support for 11 languages including Hebrew, Arabic, Spanish, French, German, Italian, Russian, Chinese, Portuguese, and Japanese
- **📝 RTL Language Support**: Native right-to-left text rendering for Hebrew and Arabic
- **🎨 Language-Specific Fonts**: Optimized typography for each supported language
- **🔄 Dynamic Language Switching**: Seamless switching between languages during study sessions

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

### 📚 **Dynamic Content Management**
- **📁 Custom Section Creation**: Users can create vocabulary sections for any supported language
- **📊 Excel/CSV Upload**: Support for .xlsx, .xls, and .csv file uploads with intelligent parsing
- **✅ Advanced Validation**: File format validation, duplicate detection, and data integrity checks
- **🏷️ Smart Categorization**: Automatic categorization of words by difficulty and learning status

### 🎮 **Engaging Study Experience**
- **⚡ Interactive Flashcards**: Modern, responsive flashcard interface with smooth animations
- **⌨️ Keyboard Shortcuts**: Full keyboard navigation support (1-4, Q-W-E-R keys for quick selection)
- **📱 Mobile-Optimized**: Fully responsive design optimized for mobile learning
- **🎨 Visual Feedback**: Immediate color-coded feedback with encouraging messages
- **⏱️ Session Customization**: Flexible session lengths (10, 20, 50, or custom word counts)

### 📊 **Comprehensive Analytics & Progress Tracking**
- **📈 Multi-Language Dashboard**: Overview of progress across all studied languages
- **🔥 Learning Streaks**: Daily and longest streak tracking with motivational elements
- **📊 Detailed Word Analytics**: Per-word statistics including accuracy, attempts, and mastery status
- **🎯 Performance Insights**: Learning velocity, retention rates, and improvement trends
- **📋 Words Progress Section**: New comprehensive view of learned words and words needing practice with advanced filtering

### 🔍 **Advanced Features**
- **🔍 Smart Search & Filtering**: Search words by original text or translation across languages
- **📱 Progressive Web App**: Installable PWA for native app-like experience
- **🌙 Performance Optimized**: Efficient API endpoints with timeout handling and error recovery
- **🔄 Real-time Updates**: Live progress updates and session statistics

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
│   │   ├── sections/       # Section management
│   │   ├── words/          # Word management
│   │   ├── progress/       # Learning progress tracking
│   │   ├── sessions/       # Study session management
│   │   ├── user-words-simple/ # Optimized word progress API
│   │   └── upload/         # File upload handling
│   ├── dashboard/          # User dashboard with analytics
│   ├── profile/            # User profile with words progress
│   ├── study/              # Study interface and flashcards
│   ├── learn/              # Language and section selection
│   ├── languages/          # Multi-language support pages
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
   git clone https://github.com/your-username/Flash-Vocab-Trainer.git
   cd Flash-Vocab-Trainer
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/vocab_trainer"
   
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
1. **Create Account**: Register with email or OAuth provider
2. **Choose Language**: Select from 11 supported languages
3. **Browse Sections**: Explore pre-loaded vocabulary or create custom sections
4. **Start Learning**: Begin flashcard sessions with customizable settings
5. **Track Progress**: Monitor your learning journey on the dashboard

### **Key Workflows**

**📚 Creating Custom Vocabulary:**
- Navigate to language selection → "Create New Section"
- Upload Excel/CSV files with proper column structure
- System validates and imports your vocabulary

**🎯 Studying Efficiently:**
- Select section and session length
- Use keyboard shortcuts for faster interaction
- Review progress and difficult words in profile

**📊 Monitoring Progress:**
- Visit dashboard for overview statistics
- Check profile → "Words Progress" for detailed analysis
- Filter by learned/difficult words across languages

## 🌟 Key Achievements

- **🏗️ Full-Stack Architecture**: End-to-end ownership from database design to user interface
- **🧠 Advanced Algorithm Implementation**: Custom SM-2 spaced repetition system with performance optimizations
- **🌍 Multilingual Support**: Comprehensive internationalization with RTL language support
- **📊 Complex Data Management**: Efficient handling of user progress across multiple languages
- **🚀 Performance Optimization**: Optimized API endpoints with intelligent caching and error handling
- **🎨 Modern UI/UX**: Responsive design with accessibility considerations
- **📱 Mobile-First Approach**: Optimized experience across all device sizes

## 🎯 Target Market

**Designed specifically for the Tel Aviv tech ecosystem**, serving:
- **Language learners** in Israel's multilingual environment
- **Tech professionals** needing efficient vocabulary acquisition
- **Educational institutions** requiring scalable learning platforms
- **International workers** adapting to local languages

## 🔮 Future Roadmap

- **🎮 Gamification**: Achievement systems, leaderboards, and learning challenges
- **🤖 AI Integration**: Personalized learning recommendations and content generation
- **🔊 Audio Support**: Pronunciation features and listening exercises
- **👥 Social Features**: Study groups and collaborative learning
- **📊 Advanced Analytics**: Machine learning insights and learning pattern analysis
- **🌐 Extended Language Support**: Addition of more languages based on user demand

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and feel free to submit issues or pull requests.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for the global learning community**
*Showcasing modern full-stack development skills for Tel Aviv's innovative tech scene*