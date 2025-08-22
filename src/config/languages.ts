export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  fontFamily: string;
  flag: string;
  isActive: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  features?: {
    hasAudio?: boolean;
    hasTones?: boolean;
    hasRomanization?: boolean;
    hasGender?: boolean;
  };
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    isRTL: true,
    fontFamily: "'Assistant', 'Rubik', 'Noto Sans Hebrew', sans-serif",
    flag: '🇮🇱',
    isActive: true,
    difficulty: 'intermediate',
    features: {
      hasAudio: true,
      hasTones: false,
      hasRomanization: true,
      hasGender: true,
    },
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    isRTL: false,
    fontFamily: "'Inter', sans-serif",
    flag: '🇪🇸',
    isActive: true,
    difficulty: 'beginner',
    features: {
      hasAudio: true,
      hasTones: false,
      hasRomanization: false,
      hasGender: true,
    },
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    isRTL: false,
    fontFamily: "'Inter', sans-serif",
    flag: '🇫🇷',
    isActive: true,
    difficulty: 'beginner',
    features: {
      hasAudio: true,
      hasTones: false,
      hasRomanization: false,
      hasGender: true,
    },
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    isRTL: false,
    fontFamily: "'Inter', sans-serif",
    flag: '🇮🇹',
    isActive: true,
    difficulty: 'beginner',
    features: {
      hasAudio: true,
      hasTones: false,
      hasRomanization: false,
      hasGender: true,
    },
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    isRTL: false,
    fontFamily: "'Inter', sans-serif",
    flag: '🇩🇪',
    isActive: true,
    difficulty: 'intermediate',
    features: {
      hasAudio: true,
      hasTones: false,
      hasRomanization: false,
      hasGender: true,
    },
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    isRTL: false,
    fontFamily: "'Noto Sans Cyrillic', sans-serif",
    flag: '🇷🇺',
    isActive: true,
    difficulty: 'advanced',
    features: {
      hasAudio: true,
      hasTones: false,
      hasRomanization: true,
      hasGender: true,
    },
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    isRTL: false,
    fontFamily: "'Noto Sans SC', sans-serif",
    flag: '🇨🇳',
    isActive: true,
    difficulty: 'advanced',
    features: {
      hasAudio: true,
      hasTones: true,
      hasRomanization: true, // Pinyin
      hasGender: false,
    },
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    isRTL: false,
    fontFamily: "'Inter', sans-serif",
    flag: '🇵🇹',
    isActive: true,
    difficulty: 'beginner',
    features: {
      hasAudio: true,
      hasTones: false,
      hasRomanization: false,
      hasGender: true,
    },
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    isRTL: false,
    fontFamily: "'Noto Sans JP', sans-serif",
    flag: '🇯🇵',
    isActive: true,
    difficulty: 'advanced',
    features: {
      hasAudio: true,
      hasTones: false,
      hasRomanization: true, // Romaji
      hasGender: false,
    },
  },
};

export const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES);

export const ACTIVE_LANGUAGES = Object.values(SUPPORTED_LANGUAGES).filter(
  (lang) => lang.isActive
);

export const RTL_LANGUAGES = Object.values(SUPPORTED_LANGUAGES).filter(
  (lang) => lang.isRTL
);

export const getLanguageConfig = (code: string): LanguageConfig | null => {
  return SUPPORTED_LANGUAGES[code] || null;
};

export const isValidLanguageCode = (code: string): boolean => {
  return LANGUAGE_CODES.includes(code);
};

export const getLanguageDirection = (code: string): 'ltr' | 'rtl' => {
  const config = getLanguageConfig(code);
  return config?.isRTL ? 'rtl' : 'ltr';
};

export const getLanguageFontFamily = (code: string): string => {
  const config = getLanguageConfig(code);
  return config?.fontFamily || "'Inter', sans-serif";
};

export const getLanguageFontClass = (code: string): string => {
  const fontClassMap: Record<string, string> = {
    he: 'font-hebrew',
    es: 'font-spanish', 
    fr: 'font-french',
    it: 'font-italian',
    de: 'font-german',
    ru: 'font-russian',
    zh: 'font-chinese',
    pt: 'font-portuguese',
    ja: 'font-japanese',
  };
  
  return fontClassMap[code] || '';
};