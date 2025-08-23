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
      <div style={{ textAlign: 'center' }}>
        <Text size="2.5rem" mb="xs">🎯</Text>
        <Title order={2} mb="xs" style={{
          background: 'linear-gradient(135deg, #11998e, #38ef7d)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Ready to Learn?
        </Title>
        <Text c="dimmed" size="lg">
          Choose your session length and start mastering vocabulary
        </Text>
      </div>

      <Paper
        shadow="lg"
        p="lg"
        radius="xl"
        withBorder
        style={{
          background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.05), rgba(56, 239, 125, 0.02))',
          border: '1px solid rgba(17, 153, 142, 0.15)',
          maxWidth: '450px',
          margin: '0 auto',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(17, 153, 142, 0.12)'
        }}
      >
        <Group gap="sm" justify="center" mb="lg">
          <Text size="1.5rem">📚</Text>
          <Text fw={600} size="lg" style={{ color: '#1f2937' }}>
            How many words would you like to study?
          </Text>
        </Group>

        <Select
          value={sessionLength}
          onChange={(value) => setSessionLength(value || '10')}
          data={[
            { value: '5', label: '🚀 5 Words (Quick Review)' },
            { value: '10', label: '⭐ 10 Words (Recommended)' },
            { value: '20', label: '💪 20 Words (Extended)' },
            { value: '50', label: '🔥 50 Words (Marathon)' },
          ]}
          size="lg"
          searchable={false}
          styles={{
            input: {
              background: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(17, 153, 142, 0.3)',
              fontSize: '16px',
              textAlign: 'center',
              borderRadius: '12px',
              padding: '12px 16px',
              fontWeight: 600
            },
            dropdown: {
              border: '1px solid rgba(17, 153, 142, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(17, 153, 142, 0.15)'
            },
            option: {
              fontSize: '15px',
              fontWeight: 500,
              padding: '12px 16px',
              borderRadius: '8px',
              margin: '4px 8px'
            }
          }}
        />
        <Paper
          p="md"
          mt="lg"
          radius="lg"
          style={{
            background: 'rgba(17, 153, 142, 0.1)',
            border: '1px solid rgba(17, 153, 142, 0.2)'
          }}
        >
          <Group justify="center" gap="md">
            <Text size="sm" fw={500} style={{ color: '#11998e' }}>
              ⏱️ Estimated time: ~{Math.ceil(parseInt(sessionLength) / 10)} minutes
            </Text>
            {parseInt(sessionLength) <= 10 && (
              <Text size="sm" fw={500} style={{ color: '#22c55e' }}>
                🎯 Perfect for focus!
              </Text>
            )}
          </Group>
        </Paper>
        {parseInt(sessionLength) > 50 && (
          <Text size="sm" fw={500} mt="xs" style={{ color: '#f59e0b' }}>
            ⚡ Challenge mode activated!
          </Text>
        )}
      </Paper>

      <Group justify="center" mt="lg" gap="md">
        <Button
          leftSection={<IconPlayerPlay size={22} />}
          size="xl"
          onClick={handleStartSession}
          loading={isNavigating}
          disabled={isNavigating}
          style={{
            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
            border: 'none',
            fontWeight: 700,
            fontSize: '18px',
            height: '60px',
            paddingLeft: '2.5rem',
            paddingRight: '2.5rem',
            borderRadius: '16px',
            boxShadow: '0 8px 25px rgba(17, 153, 142, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isNavigating) {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(17, 153, 142, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isNavigating) {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(17, 153, 142, 0.3)';
            }
          }}
        >
          {isNavigating ? '🚀 Starting...' : '🎯 Start Learning'}
        </Button>

        <Button
          leftSection={<IconEye size={20} />}
          size="lg"
          variant="outline"
          onClick={handleViewWords}
          style={{
            border: '2px solid rgba(17, 153, 142, 0.3)',
            color: '#11998e',
            fontWeight: 600,
            fontSize: '16px',
            height: '50px',
            paddingLeft: '1.8rem',
            paddingRight: '1.8rem',
            borderRadius: '12px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(17, 153, 142, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(17, 153, 142, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(17, 153, 142, 0.3)';
          }}
        >
          📖 View All Words
        </Button>
      </Group>
    </Stack>
  );
}
