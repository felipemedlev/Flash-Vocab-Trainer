'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Title,
  Paper,
  Text,
  Loader,
  Alert,
  Group,
  Badge,
  Progress,
  Tabs,
  Center,
  Button
} from '@mantine/core';
import { IconPlayerPlay, IconPlus, IconEdit, IconInfoCircle } from '@tabler/icons-react';
import StudySessionSetup from '@/components/StudySessionSetup';
import WordInput from '@/components/WordInput';
import WordManagement from '@/components/WordManagement';

interface Section {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdByUserId: number | null;
  createdAt: string;
  words: unknown[];
  totalWords: number;
  learnedWords: number;
}

export default function StudyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get('sectionId');
  const { status } = useSession();

  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('study');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSectionDetails = async () => {
      if (!sectionId) {
        router.push('/sections');
        return;
      }
      if (status === 'authenticated') {
        try {
          const response = await fetch(`/api/sections/${sectionId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setSectionData(data);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (status !== 'loading') {
      fetchSectionDetails();
    }
  }, [sectionId, status, router]);

  if (status === 'loading' || loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert icon={<IconInfoCircle size={16} />} color="red">
          {error}
        </Alert>
      </Center>
    );
  }

  if (!sectionData) {
    return (
      <Center h="100vh">
        <Alert icon={<IconInfoCircle size={16} />} color="red">
          Section not found.
        </Alert>
      </Center>
    );
  }

  const progressPercentage = sectionData.totalWords > 0 ? (sectionData.learnedWords / sectionData.totalWords) * 100 : 0;
  const wordsLeft = sectionData.totalWords - sectionData.learnedWords;
  const isCompleted = wordsLeft === 0;

  return (
    <Container size="md">
      {/* Header with Back Button */}
      <Group justify="space-between" mb="xl">
        <Button 
          variant="subtle" 
          onClick={() => router.push('/sections')}
          leftSection="←"
        >
          Back to Sections
        </Button>
        <Badge 
          color={isCompleted ? 'green' : 'blue'} 
          size="lg"
          style={{
            background: isCompleted 
              ? 'linear-gradient(135deg, #10b981, #059669)' 
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            border: 'none'
          }}
        >
          {isCompleted ? '✅ Completed' : `${wordsLeft} words left`}
        </Badge>
      </Group>

      {/* Section Info Card */}
      <Paper 
        withBorder 
        p="xl" 
        radius="lg" 
        mb="xl" 
        style={{ 
          background: 'linear-gradient(135deg, #667eea10, #764ba210)',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}
      >
        <Group justify="space-between" align="start" mb="lg">
          <div>
            <Title order={2} mb="xs" style={{ color: '#1f2937' }}>
              {sectionData.name} 📚
            </Title>
            <Text c="dimmed" size="md">
              {sectionData.description || "Master essential Hebrew vocabulary"}
            </Text>
          </div>
        </Group>

        {/* Enhanced Progress Section */}
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500} style={{ color: '#374151' }}>
              Your Progress
            </Text>
            <Text size="sm" c="dimmed">
              {Math.round(progressPercentage)}%
            </Text>
          </Group>
          <Progress 
            value={progressPercentage} 
            size="xl" 
            radius="md" 
            color={isCompleted ? 'green' : 'blue'}
            mb="md"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {sectionData.learnedWords} words learned
            </Text>
            <Text size="sm" c="dimmed">
              {sectionData.totalWords} total words
            </Text>
          </Group>
        </div>
      </Paper>

      {/* Enhanced Tabs */}
      <Paper 
        withBorder 
        radius="lg" 
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List 
            grow 
            style={{ 
              background: 'transparent',
              border: 'none',
              padding: '1rem 1rem 0 1rem'
            }}
          >
            <Tabs.Tab 
              value="study" 
              leftSection={<IconPlayerPlay size={18} />}
              style={{
                fontWeight: 600,
                fontSize: '16px',
                padding: '12px 24px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              Study Session
            </Tabs.Tab>
            <Tabs.Tab 
              value="add" 
              leftSection={<IconPlus size={18} />}
              style={{
                fontWeight: 600,
                fontSize: '16px',
                padding: '12px 24px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              Add Words
            </Tabs.Tab>
            <Tabs.Tab 
              value="manage" 
              leftSection={<IconEdit size={18} />}
              style={{
                fontWeight: 600,
                fontSize: '16px',
                padding: '12px 24px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              Manage Words
            </Tabs.Tab>
          </Tabs.List>

          <div style={{ padding: '1.5rem' }}>
            <Tabs.Panel value="study">
              <StudySessionSetup sectionId={sectionId as string} />
            </Tabs.Panel>

            <Tabs.Panel value="add">
              <WordInput 
                sectionId={sectionId as string} 
                onWordsSaved={async () => {
                  // Refresh section data without page reload
                  try {
                    const response = await fetch(`/api/sections/${sectionId}`);
                    if (response.ok) {
                      const data = await response.json();
                      setSectionData(data);
                    }
                  } catch (error) {
                    console.error('Failed to refresh section data:', error);
                  }
                }} 
              />
            </Tabs.Panel>

            <Tabs.Panel value="manage">
              <WordManagement 
                sectionId={sectionId as string}
                onWordsChange={async () => {
                  // Refresh section data without page reload
                  try {
                    const response = await fetch(`/api/sections/${sectionId}`);
                    if (response.ok) {
                      const data = await response.json();
                      setSectionData(data);
                    }
                  } catch (error) {
                    console.error('Failed to refresh section data:', error);
                  }
                }}
              />
            </Tabs.Panel>
          </div>
        </Tabs>
      </Paper>
    </Container>
  );
}