'use client';

import { Text, TextProps } from '@mantine/core';
import { getLanguageConfig } from '@/config/languages';

interface LanguageTextProps extends Omit<TextProps, 'children'> {
  text: string;
  language: string;
  className?: string;
}

export function LanguageText({ 
  text, 
  language, 
  className = '', 
  style,
  ...props 
}: LanguageTextProps) {
  const langConfig = getLanguageConfig(language);
  
  const combinedStyle = {
    fontFamily: langConfig?.fontFamily || "'Inter', sans-serif",
    direction: langConfig?.isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: langConfig?.isRTL ? 'right' as const : 'left' as const,
    ...style,
  };

  const combinedClassName = `lang-${language} ${className}`.trim();

  return (
    <Text
      {...props}
      className={combinedClassName}
      style={combinedStyle}
    >
      {text}
    </Text>
  );
}

interface LanguageDisplayProps {
  language: string;
  showFlag?: boolean;
  showNativeName?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function LanguageDisplay({ 
  language, 
  showFlag = true, 
  showNativeName = false,
  size = 'md'
}: LanguageDisplayProps) {
  const langConfig = getLanguageConfig(language);
  
  if (!langConfig) {
    return <Text size={size}>Unknown Language</Text>;
  }

  return (
    <Text size={size} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      {showFlag && <span>{langConfig.flag}</span>}
      <span>{langConfig.name}</span>
      {showNativeName && (
        <span style={{ 
          fontFamily: langConfig.fontFamily,
          direction: langConfig.isRTL ? 'rtl' : 'ltr',
          opacity: 0.7
        }}>
          ({langConfig.nativeName})
        </span>
      )}
    </Text>
  );
}