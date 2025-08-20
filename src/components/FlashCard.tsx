'use client';

import { Card, Text } from '@mantine/core';

interface FlashCardProps {
  hebrew: string;
  level: 'new' | 'learning' | 'review' | 'mastered';
}


export function FlashCard({ hebrew, level }: FlashCardProps) {
  const cardStates = {
    new: 'border-blue-100 bg-blue-50/30',
    learning: 'border-amber-100 bg-amber-50/30',
    review: 'border-gray-100 bg-gray-50/30',
    mastered: 'border-green-100 bg-green-50/30',
  };

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
            className="text-center mb-4 font-hebrew text-2xl leading-relaxed"
            dir="rtl"
          >
            {hebrew}
          </Text>
        </Card>
      </div>
    </div>
  );
}