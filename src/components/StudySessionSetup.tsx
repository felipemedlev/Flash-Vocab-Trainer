"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  Button,
  Stack,
  Text,
  Paper,
  Group,
  Title
} from '@mantine/core';
import { IconPlayerPlay, IconEye } from '@tabler/icons-react';

interface StudySessionSetupProps {
  sectionId: string;
  language?: string;
}

export default function StudySessionSetup({ sectionId, language }: StudySessionSetupProps) {
  const [sessionLength, setSessionLength] = useState('10');
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleStartSession = () => {
    if (isNavigating) return; // Prevent double navigation
    setIsNavigating(true);

    // Validate session length to prevent performance issues
    const validatedLength = Math.min(parseInt(sessionLength), 100);

    const sessionUrl = language
      ? `/study/${language}/${sectionId}/flashcard?length=${validatedLength}`
      : `/study/he/${sectionId}/flashcard?length=${validatedLength}`;
    router.push(sessionUrl);
  };

  const handleViewWords = () => {
    const wordsUrl = language
      ? `/learn/${language}/sections/${sectionId}/words`
      : `/sections/${sectionId}/words`;
    router.push(wordsUrl);
  };

  return (
    <Stack gap="lg">
      {/* Study Options */}
      <div>
        <Group gap="sm" mb="md" justify="center">
          <Text size="lg" fw={600} style={{ color: '#1f2937' }}>
            How many words would you like to study?
          </Text>
        </Group>

        <Stack gap="md" align="center">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <Select
              value={sessionLength}
              onChange={(value) => setSessionLength(value || '10')}
              data={[
                { value: '5', label: '🚀 5 Words (Quick Review)' },
                { value: '10', label: '⭐ 10 Words (Recommended)' },
                { value: '20', label: '💪 20 Words (Extended)' },
                { value: '50', label: '🔥 50 Words (Marathon)' },
              ]}
              size="md"
              searchable={false}
              withScrollArea={false}
              dropdownOpened={undefined}
              styles={{
                input: {
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '2px solid rgba(17, 153, 142, 0.3)',
                  fontSize: '15px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontWeight: 600
                },
                dropdown: {
                  border: '1px solid rgba(17, 153, 142, 0.2)',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(17, 153, 142, 0.15)'
                },
                option: {
                  fontSize: '15px',
                  fontWeight: 500,
                  padding: '10px 16px',
                  borderRadius: '8px'
                }
              }}
            />
          </div>

          <Text size="sm" c="dimmed" ta="center">
            ⏱️ Estimated time: ~{Math.ceil(parseInt(sessionLength) / 10)} minutes
            {parseInt(sessionLength) <= 10 && " • 🎯 Perfect for focus!"}
          </Text>
        </Stack>
      </div>

      <Group justify="center" gap="sm">
        <Button
          leftSection={<IconPlayerPlay size={18} />}
          size="lg"
          onClick={handleStartSession}
          loading={isNavigating}
          disabled={isNavigating}
          style={{
            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
            border: 'none',
            fontWeight: 600,
            fontSize: '16px',
            height: '48px',
            minWidth: '180px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isNavigating) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(17, 153, 142, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isNavigating) {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(17, 153, 142, 0.3)';
            }
          }}
        >
          {isNavigating ? '🚀 Starting...' : '🎯 Start Learning'}
        </Button>

        <Button
          leftSection={<IconEye size={18} />}
          size="lg"
          variant="outline"
          onClick={handleViewWords}
          style={{
            border: '2px solid rgba(17, 153, 142, 0.4)',
            color: '#11998e',
            fontWeight: 600,
            fontSize: '16px',
            height: '48px',
            minWidth: '180px',
            borderRadius: '12px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(17, 153, 142, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(17, 153, 142, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(17, 153, 142, 0.4)';
          }}
        >
          📖 View All Words
        </Button>
      </Group>
    </Stack>
  );
}
