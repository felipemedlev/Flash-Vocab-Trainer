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
import { IconPlayerPlay } from '@tabler/icons-react';

interface StudySessionSetupProps {
  sectionId: string;
}

export default function StudySessionSetup({ sectionId }: StudySessionSetupProps) {
  const [sessionLength, setSessionLength] = useState('10');
  const [focusMode, setFocusMode] = useState('all');
  const [studyMode, setStudyMode] = useState('flashcard');
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleStartSession = () => {
    if (isNavigating) return; // Prevent double navigation
    setIsNavigating(true);
    
    // Validate session length to prevent performance issues
    const validatedLength = Math.min(parseInt(sessionLength), 100);
    
    const sessionUrl = `/study/flashcard?sectionId=${sectionId}&length=${validatedLength}&mode=${focusMode}`;
    console.log('Navigating to:', sessionUrl);
    router.push(sessionUrl);
  };

  return (
    <Stack gap="lg">
      <Text size="xl" fw={700} ta="center" mb="md" style={{ color: '#1f2937' }}>
        🚀 Study Session Setup
      </Text>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <Paper 
          shadow="sm" 
          p="lg" 
          radius="md" 
          withBorder
          style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}
        >
          <Text fw={600} mb="sm" style={{ color: '#1f2937' }}>📊 Session Length</Text>
          <Select
            value={sessionLength}
            onChange={(value) => setSessionLength(value || '10')}
            data={[
              { value: '5', label: '5 Words (Quick Review)' },
              { value: '10', label: '10 Words (Recommended)' },
              { value: '20', label: '20 Words (Extended)' },
              { value: '50', label: '50 Words (Marathon)' },
            ]}
            size="md"
            styles={{
              input: {
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }
            }}
          />
          <Text size="sm" c="dimmed" mt="xs">
            ⏱️ Estimated time: ~{Math.ceil(parseInt(sessionLength) / 10)} minutes
          </Text>
          {parseInt(sessionLength) > 50 && (
            <Text size="xs" c="orange" mt="xs">
              ⚠️ Large sessions may take longer to load
            </Text>
          )}
        </Paper>

        <Paper 
          shadow="sm" 
          p="lg" 
          radius="md" 
          withBorder
          style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}
        >
          <Text fw={600} mb="sm" style={{ color: '#1f2937' }}>🎯 Focus Mode</Text>
          <Select
            value={focusMode}
            onChange={(value) => setFocusMode(value || 'all')}
            data={[
              { value: 'all', label: '🔄 Mix of all words' },
              { value: 'difficult', label: '🔥 Focus on difficult words' },
            ]}
            size="md"
            styles={{
              input: {
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }
            }}
          />
          <Text size="sm" c="dimmed" mt="xs">
            Choose your learning strategy
          </Text>
        </Paper>

        <Paper 
          shadow="sm" 
          p="lg" 
          radius="md" 
          withBorder
          style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(167, 139, 250, 0.05))',
            border: '1px solid rgba(139, 92, 246, 0.1)'
          }}
        >
          <Text fw={600} mb="sm" style={{ color: '#1f2937' }}>🎮 Study Mode</Text>
          <Select
            value={studyMode}
            onChange={(value) => setStudyMode(value || 'flashcard')}
            data={[
              { value: 'flashcard', label: '📚 Classic Flashcards' },
              { value: 'quiz', label: '❓ Multiple Choice Quiz' },
              { value: 'typing', label: '⌨️ Typing Practice' },
            ]}
            size="md"
            styles={{
              input: {
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }
            }}
          />
          <Text size="sm" c="dimmed" mt="xs">
            Pick your preferred method
          </Text>
        </Paper>
      </div>

      <Group justify="center" mt="xl">
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
          {isNavigating ? 'Starting...' : '🚀 Start Session'}
        </Button>
      </Group>
    </Stack>
  );
}
