'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Title,
  Select,
  Radio,
  Button,
  Paper,
  Text,
  Loader,
  Alert,
  Group,
  Badge,
  Progress,
  Card,
  Stack,
  SimpleGrid
} from '@mantine/core';

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
  const [sessionLength, setSessionLength] = useState('10');
  const [studyMode, setStudyMode] = useState<'all' | 'difficult'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchSectionDetails();
  }, [sectionId, status, router]);

  const estimatedTime = (parseInt(sessionLength) / 10) * 1;
  const progressPercentage = sectionData ? 
    (sectionData.totalWords > 0 ? (sectionData.learnedWords / sectionData.totalWords) * 100 : 0) : 0;

  const handleStartStudy = () => {
    if (sectionId) {
      router.push(
        `/study/flashcard?sectionId=${sectionId}&length=${sessionLength}&mode=${studyMode}`
      );
    }
  };

  const handleGoBack = () => {
    router.push('/sections');
  };

  if (status === 'loading' || loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="lg" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert color="red" mb="md">
          ❌ {error}
        </Alert>
        <Button onClick={handleGoBack}>
          ← Back to Sections
        </Button>
      </Container>
    );
  }

  if (status === 'authenticated' && sectionData) {
    const wordsLeft = sectionData.totalWords - sectionData.learnedWords;
    const isCompleted = wordsLeft === 0;
    
    return (
      <Container size="md">
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Button variant="subtle" onClick={handleGoBack}>
            ← Back to Sections
          </Button>
          <Badge color={isCompleted ? 'green' : 'blue'} size="lg">
            {isCompleted ? '✅ Completed' : `${wordsLeft} words left`}
          </Badge>
        </Group>

        {/* Section Info */}
        <Paper withBorder p="lg" radius="md" mb="xl" style={{ background: 'linear-gradient(135deg, #667eea10, #764ba210)' }}>
          <Group justify="space-between" align="start" mb="md">
            <div>
              <Title order={2} mb="xs">{sectionData.name} 📚</Title>
              <Text c="dimmed" size="md">
                {sectionData.description || "Master essential Hebrew vocabulary"}
              </Text>
            </div>
          </Group>

          {/* Progress Bar */}
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>Your Progress</Text>
              <Text size="sm" c="dimmed">{Math.round(progressPercentage)}%</Text>
            </Group>
            <Progress 
              value={progressPercentage} 
              size="lg" 
              radius="md" 
              color={isCompleted ? 'green' : 'blue'}
              mb="md"
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

        {/* Study Setup */}
        <Paper withBorder p="lg" radius="md" mb="xl">
          <Title order={3} mb="lg">
            {isCompleted ? '🔄 Review Session Setup' : '🚀 Study Session Setup'}
          </Title>
          
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {/* Session Length */}
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={500} mb="md">📊 Session Length</Text>
              <Select
                value={sessionLength}
                onChange={(value) => setSessionLength(value || '10')}
                data={[
                  { value: '5', label: '5 Words (Quick Review)' },
                  { value: '10', label: '10 Words (Recommended)' },
                  { value: '20', label: '20 Words (Extended)' },
                  { value: '50', label: '50 Words (Marathon)' },
                  {
                    value: Math.min(sectionData.totalWords, wordsLeft || sectionData.totalWords).toString(),
                    label: isCompleted ? 
                      `All Words (${sectionData.totalWords})` : 
                      `Remaining Words (${wordsLeft})`,
                  },
                ]}
                size="md"
              />
              <Text size="sm" c="dimmed" mt="xs">
                ⏱️ Estimated time: ~{estimatedTime} minutes
              </Text>
            </Card>

            {/* Study Mode */}
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={500} mb="md">🎯 Study Mode</Text>
              <Radio.Group
                value={studyMode}
                onChange={(value) => setStudyMode(value as 'all' | 'difficult')}
              >
                <Stack gap="sm">
                  <Radio 
                    value="all" 
                    label="All Words"
                    description="Practice all available words"
                  />
                  <Radio 
                    value="difficult" 
                    label="Difficult Words Only"
                    description="Focus on challenging vocabulary"
                  />
                </Stack>
              </Radio.Group>
            </Card>
          </SimpleGrid>
        </Paper>

        {/* Action Buttons */}
        <Paper withBorder p="lg" radius="md" style={{ textAlign: 'center' }}>
          <Group justify="center" gap="lg">
            <Button 
              size="xl" 
              onClick={handleStartStudy}
              style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '12px 32px'
              }}
            >
              {isCompleted ? '🔄 Start Review' : '🚀 Begin Study Session'}
            </Button>
          </Group>
          
          {!isCompleted && (
            <Text size="sm" c="dimmed" mt="lg">
              💡 Pro tip: Start with 10 words to build momentum, then increase as you get comfortable!
            </Text>
          )}
          
          {isCompleted && (
            <Alert color="green" variant="light" mt="lg">
              🎉 Congratulations! You&apos;ve completed this section. Keep reviewing to maintain your knowledge.
            </Alert>
          )}
        </Paper>
      </Container>
    );
  }

  return null;
}