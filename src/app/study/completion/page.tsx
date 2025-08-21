'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  SimpleGrid,
  Progress,
  Badge,
  Divider,
  Alert, Loader
} from '@mantine/core';
import {
  IconTarget,
  IconFlame,
  IconBooks,
  IconChartBar,
  IconRefresh,
  IconHome
} from '@tabler/icons-react';
import Link from 'next/link';

interface SessionStats {
  sessionId: number;
  wordsStudied: number;
  correctAnswers: number;
  accuracy: number;
  sessionLength: number;
  currentStreak: number;
  totalWordsLearned: number;
  wordsLearnedInSession?: number;
  message: string;
}

function SessionCompletionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get session data from URL params
  const sectionId = searchParams.get('sectionId');
  const wordsStudied = parseInt(searchParams.get('wordsStudied') || '0');
  const correctAnswers = parseInt(searchParams.get('correctAnswers') || '0');
  const sessionLength = parseInt(searchParams.get('sessionLength') || '0');
  const wordsLearnedInSession = parseInt(searchParams.get('wordsLearnedInSession') || '0');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status]);

  useEffect(() => {
    const recordSession = async () => {
      if (!sectionId || wordsStudied === 0) {
        setError('Invalid session data');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sectionId: parseInt(sectionId),
            wordsStudied,
            correctAnswers,
            sessionLength,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to record session');
        }

        const data = await response.json();
        // Add session-specific words learned count
        setSessionStats({
          ...data,
          wordsLearnedInSession: wordsLearnedInSession
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      recordSession();
    }
  }, [sectionId, wordsStudied, correctAnswers, sessionLength, status, wordsLearnedInSession]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'green';
    if (accuracy >= 70) return 'yellow';
    return 'red';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Incredible dedication! 🚀';
    if (streak >= 7) return 'Amazing streak! 🔥';
    if (streak >= 3) return 'Great momentum! 💪';
    if (streak >= 1) return 'Keep it up! ⭐';
    return 'Start your streak today! 🌱';
  };

  if (status === 'loading' || loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Recording your progress...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md">
        <Alert color="red" mb="md">
          ❌ {error}
        </Alert>
        <Button component={Link} href="/dashboard">
          ← Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!sessionStats) {
    return (
      <Container size="md">
        <Alert color="orange" mb="md">
          No session data available
        </Alert>
        <Button component={Link} href="/dashboard">
          ← Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md">
      {/* Celebration Header */}
      <Paper withBorder p="xl" radius="md" mb="xl" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Text size="4rem" mb="md">🎉</Text>
        <Title order={1} mb="md">Session Complete!</Title>
        <Text size="lg" style={{ opacity: 0.9 }}>
          {sessionStats.message}
        </Text>
      </Paper>

      {/* Session Stats */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} mb="xl">
        <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
          <IconBooks size={32} style={{ margin: '0 auto', marginBottom: '8px' }} color="#667eea" />
          <Text size="xl" fw={700} c="blue">{sessionStats.wordsStudied}</Text>
          <Text size="sm" c="dimmed">Words Studied</Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
          <IconTarget size={32} style={{ margin: '0 auto', marginBottom: '8px' }} color="#38ef7d" />
          <Text size="xl" fw={700} c="green">{sessionStats.correctAnswers}</Text>
          <Text size="sm" c="dimmed">Correct Answers</Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
          <IconChartBar size={32} style={{ margin: '0 auto', marginBottom: '8px' }} color={getAccuracyColor(sessionStats.accuracy)} />
          <Text size="xl" fw={700} c={getAccuracyColor(sessionStats.accuracy)}>
            {sessionStats.accuracy}%
          </Text>
          <Text size="sm" c="dimmed">Accuracy</Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
          <IconFlame size={32} style={{ margin: '0 auto', marginBottom: '8px' }} color="#ff6b6b" />
          <Text size="xl" fw={700} c="red">{sessionStats.currentStreak}</Text>
          <Text size="sm" c="dimmed">Day Streak</Text>
        </Card>
      </SimpleGrid>

      {/* Words Learned This Session */}
      {(sessionStats.wordsLearnedInSession || 0) > 0 && (
        <Paper withBorder p="lg" radius="md" mb="xl" style={{ 
          background: 'linear-gradient(135deg, #e8f5e8, #f0f8ff)',
          textAlign: 'center'
        }}>
          <Text size="4rem" mb="md">🎓</Text>
          <Title order={3} mb="xs" c="green">
            {sessionStats.wordsLearnedInSession} New Word{sessionStats.wordsLearnedInSession !== 1 ? 's' : ''} Mastered!
          </Title>
          <Text c="dimmed" size="md">
            {`You've successfully learned ${sessionStats.wordsLearnedInSession} word${sessionStats.wordsLearnedInSession !== 1 ? 's' : ''} in this session using our intelligent spaced repetition system.`}
          </Text>
          <Badge color="green" variant="light" size="lg" mt="md">
            🧠 SM-2 Algorithm Applied
          </Badge>
        </Paper>
      )}

      {/* No Words Learned Message */}
      {(sessionStats.wordsLearnedInSession || 0) === 0 && (
        <Alert color="blue" variant="light" mb="xl">
          <Text fw={500} mb="xs">📚 Keep Building Your Knowledge!</Text>
          <Text size="sm">
            {`While you didn't master any new words this session, you're reinforcing your existing knowledge. 
            Consistent practice with our spaced repetition system will help you retain what you've learned!`}
          </Text>
        </Alert>
      )}

      {/* Additional Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl">
        <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
          <Text size="2rem" mb="xs">📈</Text>
          <Text size="lg" fw={500} mb="xs">Session Words</Text>
          <Text size="xl" fw={700} c="blue">{sessionStats.wordsLearnedInSession || 0}</Text>
          <Text size="xs" c="dimmed">Learned this session</Text>
        </Card>

        <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
          <Text size="2rem" mb="xs">🏆</Text>
          <Text size="lg" fw={500} mb="xs">Total Mastered</Text>
          <Text size="xl" fw={700} c="green">{sessionStats.totalWordsLearned}</Text>
          <Text size="xs" c="dimmed">All time learned</Text>
        </Card>
      </SimpleGrid>

      {/* Performance Analysis */}
      <Paper withBorder p="lg" radius="md" mb="xl">
        <Title order={3} mb="md">📊 Session Analysis</Title>
        
        <Stack gap="md">
          <div>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Accuracy Rate</Text>
              <Badge color={getAccuracyColor(sessionStats.accuracy)} size="lg">
                {sessionStats.accuracy}%
              </Badge>
            </Group>
            <Progress 
              value={sessionStats.accuracy} 
              color={getAccuracyColor(sessionStats.accuracy)} 
              size="lg" 
              radius="md" 
            />
          </div>

          <Divider />

          <Group justify="space-between">
            <div>
              <Text fw={500}>Study Streak</Text>
              <Text size="sm" c="dimmed">
                {getStreakMessage(sessionStats.currentStreak)}
              </Text>
            </div>
            <Badge size="xl" color="orange">
              🔥 {sessionStats.currentStreak} days
            </Badge>
          </Group>

          <Divider />

          <Group justify="space-between">
            <div>
              <Text fw={500}>Total Words Learned</Text>
              <Text size="sm" c="dimmed">
                Your vocabulary is growing!
              </Text>
            </div>
            <Badge size="xl" color="blue">
              📚 {sessionStats.totalWordsLearned} words
            </Badge>
          </Group>
        </Stack>
      </Paper>

      {/* Motivational Message */}
      {sessionStats.accuracy >= 80 ? (
        <Alert color="green" variant="light" mb="xl">
          <Text fw={500}>🌟 Excellent Performance!</Text>
          <Text size="sm">
            You&apos;re mastering Hebrew vocabulary at an impressive pace. Keep up the fantastic work!
          </Text>
        </Alert>
      ) : sessionStats.accuracy >= 60 ? (
        <Alert color="yellow" variant="light" mb="xl">
          <Text fw={500}>💪 Good Progress!</Text>
          <Text size="sm">
            You&apos;re making solid progress. Consider reviewing difficult words to boost your accuracy.
          </Text>
        </Alert>
      ) : (
        <Alert color="orange" variant="light" mb="xl">
          <Text fw={500}>🎯 Room for Improvement</Text>
          <Text size="sm">
            Don&apos;t worry! Learning takes time. Try focusing on difficult words in your next session.
          </Text>
        </Alert>
      )}

      {/* Action Buttons */}
      <Group justify="center" gap="md">
        <Button
          size="lg"
          leftSection={<IconRefresh size={20} />}
          onClick={() => router.push(`/study/${sectionId}`)}
          style={{ 
            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
          }}
        >
          Study Again
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          leftSection={<IconBooks size={20} />}
          component={Link}
          href="/sections"
        >
          Choose New Section
        </Button>
        
        <Button
          size="lg"
          variant="subtle"
          leftSection={<IconHome size={20} />}
          component={Link}
          href="/dashboard"
        >
          Dashboard
        </Button>
      </Group>
    </Container>
  );
}

export default function SessionCompletionPage() {
  return (
    <Suspense fallback={
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="lg" />
      </Container>
    }>
      <SessionCompletionContent />
    </Suspense>
  );
}
