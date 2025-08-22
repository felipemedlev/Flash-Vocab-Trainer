'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Container,
  Title,
  Grid,
  Paper,
  Text,
  Loader,
  Button,
  Group,
  Badge,
  Progress,
  Alert,
  Card,
  SimpleGrid,
  Anchor
} from '@mantine/core';
import Link from 'next/link';
interface SectionProgress {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  totalWords: number;
  learnedWords: number;
}

const ProgressChart = dynamic(() => import('./components/ProgressChart'), {
  ssr: false,
});

interface DashboardData {
  wordsLearned: number;
  sectionsCompleted: number;
  studyStreak: number;
}

interface RecentSection {
  id: number;
  name: string;
  progress: number;
  totalWords: number;
  learnedWords: number;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentSections, setRecentSections] = useState<RecentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStudied, setTodayStudied] = useState(false);
  const [dailyProgress, setDailyProgress] = useState({
    wordsStudied: 0,
    target: 10,
    progress: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        try {
          const [dashboardResponse, sectionsResponse, sessionsResponse] = await Promise.all([
            fetch('/api/dashboard'),
            fetch('/api/sections'),
            fetch('/api/sessions')
          ]);

          if (dashboardResponse.ok) {
            const data = await dashboardResponse.json();
            setDashboardData(data);
          }

          if (sectionsResponse.ok) {
            const sectionsData = await sectionsResponse.json();
            const sectionsWithProgress = sectionsData.map((section: SectionProgress) => ({
              ...section,
              progress: section.totalWords > 0 ? (section.learnedWords / section.totalWords) * 100 : 0
            })).slice(0, 3); // Show top 3 recent sections
            setRecentSections(sectionsWithProgress);
          }

          if (sessionsResponse.ok) {
            const sessionData = await sessionsResponse.json();
            setDailyProgress({
              wordsStudied: sessionData.todayWordsStudied,
              target: sessionData.dailyTarget,
              progress: sessionData.dailyProgress
            });
            setTodayStudied(sessionData.hasStudiedToday);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status]);

  const handleQuickStudy = () => {
    router.push('/sections');
  };

  if (status === 'loading' || loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="lg" />
      </Container>
    );
  }

  if (status === 'authenticated' && dashboardData) {
    const streakColor = dashboardData.studyStreak >= 7 ? 'green' : dashboardData.studyStreak >= 3 ? 'orange' : 'blue';

    return (
      <Container size="xl">
        {/* Welcome Header */}
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1} mb="xs">Welcome Back! 👋</Title>
            <Text size="lg" c="dimmed">Ready to continue your Hebrew learning journey?</Text>
          </div>
          <Group>
            {!todayStudied && (
              <Alert color="orange" variant="light">
                📅 Haven&apos;t studied today yet!
              </Alert>
            )}
            <Badge
              size="lg"
              color={streakColor}
            >
              🔥 {dashboardData.studyStreak} day streak
            </Badge>
          </Group>
        </Group>

        {/* Quick Action Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="xl">
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
            onClick={handleQuickStudy}
          >
            <Group justify="space-between" mb="xs">
              <Text size="2rem">▶️</Text>
              <Text size="sm">→</Text>
            </Group>
            <Text size="lg" fw={500}>Start Studying</Text>
            <Text size="sm" style={{ opacity: 0.9 }}>Continue where you left off</Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="2rem">🎯</Text>
              <Text size="xs" c="dimmed">Goal</Text>
            </Group>
            <Text size="lg" fw={500}>Daily Target</Text>
            <Progress
              value={dailyProgress.progress}
              color={dailyProgress.progress >= 100 ? "green" : "blue"}
              size="sm"
              mt="xs"
            />
            <Text size="xs" c="dimmed" mt="xs">
              {dailyProgress.progress >= 100
                ? '✅ Target achieved!'
                : `${Math.max(0, dailyProgress.target - dailyProgress.wordsStudied)} words remaining`
              }
            </Text>
            <Text size="xs" c="dimmed">
              {dailyProgress.wordsStudied}/{dailyProgress.target} words today
            </Text>
          </Card>

          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            component={Link}
            href="/profile"
            style={{ textDecoration: 'none' }}
          >
            <Group justify="space-between" mb="xs">
              <Text size="2rem">👤</Text>
              <Text size="sm" c="dimmed">→</Text>
            </Group>
            <Text size="lg" fw={500}>Profile</Text>
            <Text size="sm" c="dimmed">View your achievements</Text>
          </Card>
        </SimpleGrid>

        {/* Stats Grid */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md" h="100%" style={{ background: 'linear-gradient(135deg, #667eea20, #764ba220)' }}>
              <Group mb="xs">
                <Text size="1.5rem">📚</Text>
                <Text size="sm" fw={500} c="dimmed">WORDS LEARNED</Text>
              </Group>
              <Text size="2rem" fw={700} c="blue">{dashboardData.wordsLearned}</Text>
              <Text size="xs" c="dimmed">Keep building your vocabulary!</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md" h="100%" style={{ background: 'linear-gradient(135deg, #11998e20, #38ef7d20)' }}>
              <Group mb="xs">
                <Text size="1.5rem">🏆</Text>
                <Text size="sm" fw={500} c="dimmed">SECTIONS COMPLETED</Text>
              </Group>
              <Text size="2rem" fw={700} c="green">{dashboardData.sectionsCompleted}</Text>
              <Text size="xs" c="dimmed">Great progress!</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md" h="100%" style={{ background: 'linear-gradient(135deg, #ff930020, #ff658020)' }}>
              <Group mb="xs">
                <Text size="1.5rem">🔥</Text>
                <Text size="sm" fw={500} c="dimmed">CURRENT STREAK</Text>
              </Group>
              <Text size="2rem" fw={700} c={streakColor}>{dashboardData.studyStreak}</Text>
              <Text size="xs" c="dimmed">
                {dashboardData.studyStreak === 0 ? 'Start your streak today!' : 'Days in a row'}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Recent Sections */}
        {recentSections.length > 0 && (
          <Paper withBorder p="md" radius="md" mb="xl">
            <Group justify="space-between" mb="md">
              <Title order={3}>Continue Learning 📖</Title>
              <Anchor component={Link} href="/sections" size="sm">
                View all sections →
              </Anchor>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 3 }}>
              {recentSections.map((section) => (
                <Card
                  key={section.id}
                  shadow="xs"
                  padding="md"
                  radius="md"
                  withBorder
                  component={Link}
                  href={`/study?sectionId=${section.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Text fw={500} mb="xs">{section.name}</Text>
                  <Progress value={section.progress} color="blue" size="sm" mb="xs" />
                  <Text size="xs" c="dimmed">
                    {section.learnedWords} / {section.totalWords} words
                    {section.progress === 100 ? ' ✅' : ` (${Math.round(section.progress)}%)`}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        )}

        {/* Progress Chart */}
        <Paper withBorder p="md" radius="md" mb="xl">
          <Title order={3} mb="md">Your Progress 📈</Title>
          <ProgressChart />
        </Paper>

        {/* Motivational CTA */}
        {dailyProgress.progress < 100 && (
          <Paper withBorder p="lg" radius="md" style={{ background: 'linear-gradient(45deg, #e3f2fd, #f3e5f5)' }}>
            <Group justify="space-between">
              <div>
                <Title order={4} mb="xs">
                  {dailyProgress.wordsStudied === 0
                    ? 'Ready to start today? 🧠'
                    : `You're ${dailyProgress.target - dailyProgress.wordsStudied} words away from your goal! 🎯`
                  }
                </Title>
                <Text c="dimmed">
                  {dailyProgress.wordsStudied === 0
                    ? 'Keep your streak alive and learn something new!'
                    : 'Keep going to achieve your daily target!'
                  }
                </Text>
              </div>
              <Button
                size="lg"
                onClick={handleQuickStudy}
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                Continue Learning
              </Button>
            </Group>
          </Paper>
        )}

        {dailyProgress.progress >= 100 && (
          <Paper withBorder p="lg" radius="md" style={{ background: 'linear-gradient(45deg, #e8f5e8, #f0f8ff)' }}>
            <Group justify="space-between">
              <div>
                <Title order={4} mb="xs">🎉 Daily target achieved!</Title>
                <Text c="dimmed">Great job! You can always study more to boost your progress.</Text>
              </div>
              <Button
                size="lg"
                onClick={handleQuickStudy}
                variant="outline"
              >
                📚 Extra Practice
              </Button>
            </Group>
          </Paper>
        )}
      </Container>
    );
  }

  return null;
}