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
import { 
  IconBooks, 
  IconTrophy, 
  IconFlame, 
  IconGlobe, 
  IconPlayerPlay,
  IconArrowRight,
  IconStar
} from '@tabler/icons-react';
import Link from 'next/link';
import { SUPPORTED_LANGUAGES } from '@/config/languages';

interface LanguageProgress {
  languageCode: string;
  languageName: string;
  nativeName: string;
  isRTL: boolean;
  totalWords: number;
  learnedWords: number;
  sectionsCompleted: number;
  totalSections: number;
  progress: number;
}

interface SectionProgress {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  totalWords: number;
  learnedWords: number;
  language: {
    code: string;
    name: string;
    nativeName: string;
  };
}

const ProgressChart = dynamic(() => import('./components/ProgressChart'), {
  ssr: false,
});

interface DashboardData {
  totalWordsLearned: number;
  totalSectionsCompleted: number;
  studyStreak: number;
  languagesStudied: number;
  mostStudiedLanguage: string;
}

interface RecentSection {
  id: number;
  name: string;
  progress: number;
  totalWords: number;
  learnedWords: number;
  language: {
    code: string;
    name: string;
    nativeName: string;
  };
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [languageProgress, setLanguageProgress] = useState<LanguageProgress[]>([]);
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
          // Fetch sections for all languages
          const sectionsResponse = await fetch('/api/sections');
          let allSections: SectionProgress[] = [];
          const languageStats: Record<string, LanguageProgress> = {};

          if (sectionsResponse.ok) {
            allSections = await sectionsResponse.json();
            
            // Process sections by language
            Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
              const langConfig = SUPPORTED_LANGUAGES[langCode];
              const langSections = allSections.filter(s => s.language.code === langCode);
              
              const totalWords = langSections.reduce((sum, s) => sum + s.totalWords, 0);
              const learnedWords = langSections.reduce((sum, s) => sum + s.learnedWords, 0);
              const sectionsCompleted = langSections.filter(s => s.learnedWords === s.totalWords && s.totalWords > 0).length;
              
              languageStats[langCode] = {
                languageCode: langCode,
                languageName: langConfig.name,
                nativeName: langConfig.nativeName,
                isRTL: langConfig.isRTL,
                totalWords,
                learnedWords,
                sectionsCompleted,
                totalSections: langSections.length,
                progress: totalWords > 0 ? (learnedWords / totalWords) * 100 : 0
              };
            });

            setLanguageProgress(Object.values(languageStats).filter(lang => lang.totalWords > 0));
            
            // Set recent sections (top 6)
            const sectionsWithProgress = allSections.map((section: SectionProgress) => ({
              ...section,
              progress: section.totalWords > 0 ? (section.learnedWords / section.totalWords) * 100 : 0
            })).slice(0, 6);
            setRecentSections(sectionsWithProgress);
          }

          // Calculate overall dashboard data
          const totalWordsLearned = Object.values(languageStats).reduce((sum, lang) => sum + lang.learnedWords, 0);
          const totalSectionsCompleted = Object.values(languageStats).reduce((sum, lang) => sum + lang.sectionsCompleted, 0);
          const languagesStudied = Object.values(languageStats).filter(lang => lang.learnedWords > 0).length;
          const mostStudiedLanguage = Object.values(languageStats).reduce((prev, current) => 
            (prev.learnedWords > current.learnedWords) ? prev : current
          )?.languageName || 'None';

          setDashboardData({
            totalWordsLearned,
            totalSectionsCompleted,
            studyStreak: 5, // This would come from actual session tracking
            languagesStudied,
            mostStudiedLanguage
          });

          // Mock daily progress (would come from actual API)
          setDailyProgress({
            wordsStudied: Math.min(totalWordsLearned % 15, 10),
            target: 10,
            progress: Math.min((totalWordsLearned % 15) * 10, 100)
          });
          setTodayStudied(totalWordsLearned > 0);

        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status]);

  const handleQuickStudy = () => {
    router.push('/');
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
            <Title order={1} mb="xs">Welcome Back! 🌍</Title>
            <Text size="lg" c="dimmed">Ready to continue your multi-language learning journey?</Text>
          </div>
          <Group>
            {!todayStudied && (
              <Alert color="orange" variant="light">
                📅 Haven&apos;t studied today yet!
              </Alert>
            )}
            <Badge size="lg" color={streakColor}>
              🔥 {dashboardData.studyStreak} day streak
            </Badge>
          </Group>
        </Group>

        {/* Quick Action Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
            onClick={handleQuickStudy}
          >
            <Group justify="space-between" mb="xs">
              <IconPlayerPlay size={24} />
              <IconArrowRight size={16} />
            </Group>
            <Text size="lg" fw={500}>Choose Language</Text>
            <Text size="sm" style={{ opacity: 0.9 }}>Start studying any language</Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <IconStar size={24} color="gold" />
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
              <IconTrophy size={24} />
              <IconArrowRight size={16} />
            </Group>
            <Text size="lg" fw={500}>Achievements</Text>
            <Text size="sm" c="dimmed">View your progress</Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <IconGlobe size={24} />
              <Text size="xs" c="dimmed">Active</Text>
            </Group>
            <Text size="lg" fw={500}>Languages</Text>
            <Text size="xl" fw={700} c="blue">{dashboardData.languagesStudied}</Text>
            <Text size="xs" c="dimmed">Currently studying</Text>
          </Card>
        </SimpleGrid>

        {/* Overall Stats Grid */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md" h="100%" style={{ background: 'linear-gradient(135deg, #667eea20, #764ba220)' }}>
              <Group mb="xs">
                <IconBooks size={24} />
                <Text size="sm" fw={500} c="dimmed">TOTAL WORDS LEARNED</Text>
              </Group>
              <Text size="2rem" fw={700} c="blue">{dashboardData.totalWordsLearned}</Text>
              <Text size="xs" c="dimmed">Across all languages</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md" h="100%" style={{ background: 'linear-gradient(135deg, #11998e20, #38ef7d20)' }}>
              <Group mb="xs">
                <IconTrophy size={24} />
                <Text size="sm" fw={500} c="dimmed">SECTIONS COMPLETED</Text>
              </Group>
              <Text size="2rem" fw={700} c="green">{dashboardData.totalSectionsCompleted}</Text>
              <Text size="xs" c="dimmed">Great progress!</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md" h="100%" style={{ background: 'linear-gradient(135deg, #ff930020, #ff658020)' }}>
              <Group mb="xs">
                <IconFlame size={24} />
                <Text size="sm" fw={500} c="dimmed">CURRENT STREAK</Text>
              </Group>
              <Text size="2rem" fw={700} c={streakColor}>{dashboardData.studyStreak}</Text>
              <Text size="xs" c="dimmed">
                {dashboardData.studyStreak === 0 ? 'Start your streak today!' : 'Days in a row'}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Language Progress Overview */}
        {languageProgress.length > 0 && (
          <Paper withBorder p="md" radius="md" mb="xl">
            <Group justify="space-between" mb="md">
              <Title order={3}>Your Languages 🌍</Title>
              <Anchor component={Link} href="/" size="sm">
                View all languages →
              </Anchor>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              {languageProgress.map((lang) => (
                <Card
                  key={lang.languageCode}
                  shadow="xs"
                  padding="md"
                  radius="md"
                  withBorder
                  component={Link}
                  href={`/learn/${lang.languageCode}/sections`}
                  style={{ textDecoration: 'none' }}
                >
                  <Group justify="space-between" mb="xs">
                    <div>
                      <Text fw={500}>{lang.languageName}</Text>
                      <Text size="sm" c="dimmed" style={{ direction: lang.isRTL ? 'rtl' : 'ltr' }}>
                        {lang.nativeName}
                      </Text>
                    </div>
                    <Badge color="blue" variant="light">
                      {Math.round(lang.progress)}%
                    </Badge>
                  </Group>
                  <Progress value={lang.progress} color="blue" size="sm" mb="xs" />
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {lang.learnedWords} / {lang.totalWords} words
                    </Text>
                    <Text size="xs" c="dimmed">
                      {lang.sectionsCompleted} / {lang.totalSections} sections
                    </Text>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        )}

        {/* Recent Sections */}
        {recentSections.length > 0 && (
          <Paper withBorder p="md" radius="md" mb="xl">
            <Group justify="space-between" mb="md">
              <Title order={3}>Continue Learning 📖</Title>
              <Anchor component={Link} href="/" size="sm">
                Browse all languages →
              </Anchor>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
              {recentSections.map((section) => (
                <Card
                  key={section.id}
                  shadow="xs"
                  padding="md"
                  radius="md"
                  withBorder
                  component={Link}
                  href={`/study/${section.language.code}/${section.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Group justify="space-between" mb="xs">
                    <div>
                      <Text fw={500} mb={2}>{section.name}</Text>
                      <Badge size="xs" variant="light">
                        {section.language.name}
                      </Badge>
                    </div>
                  </Group>
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
                    ? 'Choose any language and keep your streak alive!'
                    : 'Keep going to achieve your daily target!'
                  }
                </Text>
              </div>
              <Button
                size="lg"
                onClick={handleQuickStudy}
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                Choose Language
              </Button>
            </Group>
          </Paper>
        )}

        {dailyProgress.progress >= 100 && (
          <Paper withBorder p="lg" radius="md" style={{ background: 'linear-gradient(45deg, #e8f5e8, #f0f8ff)' }}>
            <Group justify="space-between">
              <div>
                <Title order={4} mb="xs">🎉 Daily target achieved!</Title>
                <Text c="dimmed">Great job! You can always study more languages to boost your progress.</Text>
              </div>
              <Button
                size="lg"
                onClick={handleQuickStudy}
                variant="outline"
              >
                🌍 Study More Languages
              </Button>
            </Group>
          </Paper>
        )}
      </Container>
    );
  }

  return null;
}