"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Select,
    Button,
    Stack,
    Text,
    Paper,
    Group
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
      <Text size="xl" fw={700} ta="center" mb="md" style={{ color: '#1f2937' }}>
        🚀 Start Your Study Session
      </Text>

      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        withBorder
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          maxWidth: '400px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <Text fw={600} mb="lg" style={{ color: '#1f2937' }}>📊 How many words would you like to study?</Text>
        <Select
          value={sessionLength}
          onChange={(value) => setSessionLength(value || '10')}
          data={[
            { value: '5', label: '5 Words (Quick Review)' },
            { value: '10', label: '10 Words (Recommended)' },
            { value: '20', label: '20 Words (Extended)' },
            { value: '50', label: '50 Words (Marathon)' },
          ]}
          size="lg"
          searchable={false}
          styles={{
            input: {
              background: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              fontSize: '16px',
              textAlign: 'center'
            }
          }}
        />
        <Text size="sm" c="dimmed" mt="md">
          ⏱️ Estimated time: ~{Math.ceil(parseInt(sessionLength) / 10)} minutes
        </Text>
        {parseInt(sessionLength) > 50 && (
          <Text size="xs" c="orange" mt="xs">
            ⚠️ Large sessions may take longer to load
          </Text>
        )}
      </Paper>

      <Group justify="center" mt="xl" gap="md">
        <Button
          leftSection={<IconPlayerPlay size={20} />}
          size="xl"
          onClick={handleStartSession}
          loading={isNavigating}
          disabled={isNavigating}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            border: 'none',
            fontWeight: 700,
            fontSize: '18px',
            height: '56px',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isNavigating) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isNavigating) {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
            }
          }}
        >
          {isNavigating ? 'Starting...' : 'Start Session'}
        </Button>

        <Button
          leftSection={<IconEye size={20} />}
          size="lg"
          variant="outline"
          onClick={handleViewWords}
          style={{
            border: '2px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
            fontWeight: 600,
            fontSize: '16px',
            height: '48px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          View All Words
        </Button>
      </Group>
    </Stack>
  );
}
