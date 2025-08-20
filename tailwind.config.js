/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        correct: 'var(--correct)',
        incorrect: 'var(--incorrect)',
        learning: 'var(--learning)',
        mastered: 'var(--mastered)',
      },
      fontFamily: {
        hebrew: ['Assistant', 'Rubik', 'Noto Sans Hebrew', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        fadeInUp: 'fadeInUp 0.5s ease-out',
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
          },
        },
      },
    },
  },
  plugins: [],
};