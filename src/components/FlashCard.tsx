'use client';

import { Card, Text } from '@mantine/core';
import { getLanguageFontClass } from '@/config/languages';

interface FlashCardProps {
  originalText: string;
  pronunciation?: string;
  level: 'new' | 'learning' | 'review' | 'mastered';
  isRTL?: boolean;
  languageCode?: string;
}


export function FlashCard({ originalText, pronunciation, level, isRTL = false, languageCode }: FlashCardProps) {
  const cardStates = {
    new: 'border-blue-100 bg-blue-50/30',
    learning: 'border-amber-100 bg-amber-50/30',
    review: 'border-gray-100 bg-gray-50/30',
    mastered: 'border-green-100 bg-green-50/30',
  };

  const fontClass = languageCode ? getLanguageFontClass(languageCode) : '';

  return (
    <div>
      <div>
        <Card
          shadow="xs"
          padding="lg"
          radius="md"
          className={`
            bg-white/80 backdrop-blur-sm
            border
            transition-all duration-200 ease-out
            cursor-pointer select-none
            min-h-[100px] flex flex-col justify-center
            ${cardStates[level]}
          `}
          styles={{
            root: {
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            },
          }}
        >
          <Text
            size="xl"
            fw={600}
            className={`text-center mb-4 text-2xl leading-relaxed ${fontClass}`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {originalText}
          </Text>
          {pronunciation && (
            <Text
              size="sm"
              c="dimmed"
              className="text-center mt-2"
            >
              [{pronunciation}]
            </Text>
          )}
        </Card>
      </div>
    </div>
  );
}