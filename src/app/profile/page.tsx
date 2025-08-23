'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  TextInput,
  Button,
  Paper,
  Text,
  Grid,
  Loader,
  Alert,
  Badge,
  Group,
  Stack,
  Card,
  SimpleGrid,
  Progress,
} from '@mantine/core';
import { IconGlobe, IconBooks, IconTrophy, IconFlame, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { SUPPORTED_LANGUAGES } from '@/config/languages';

interface UserStats {
  totalWordsLearned: number;
  sectionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  languagesStudied: number;
  totalSections: number;
}

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [languageProgress, setLanguageProgress] = useState<LanguageProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      if (session?.user) {
        setUsername(session.user.name || '');
        setEmail(session.user.email || '');

        try {
          // Fetch user profile data
          const profileResponse = await fetch('/api/profile');
          let profileData = null;
          if (profileResponse.ok) {
            profileData = await profileResponse.json();
          }

          // Fetch sections data for all languages
          const sectionsResponse = await fetch('/api/sections');
          if (sectionsResponse.ok) {
            const allSections = await sectionsResponse.json();
            const languageStats: Record<string, LanguageProgress> = {};
            
            // Process sections by language
            Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
              const langConfig = SUPPORTED_LANGUAGES[langCode];
              const langSections = allSections.filter((s: any) => s.language.code === langCode);
              
              const totalWords = langSections.reduce((sum: number, s: any) => sum + s.totalWords, 0);
              const learnedWords = langSections.reduce((sum: number, s: any) => sum + s.learnedWords, 0);
              const sectionsCompleted = langSections.filter((s: any) => s.learnedWords === s.totalWords && s.totalWords > 0).length;
              
              if (totalWords > 0) {
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
              }
            });

            setLanguageProgress(Object.values(languageStats));

            // Calculate overall stats
            const totalWordsLearned = Object.values(languageStats).reduce((sum, lang) => sum + lang.learnedWords, 0);
            const totalSectionsCompleted = Object.values(languageStats).reduce((sum, lang) => sum + lang.sectionsCompleted, 0);
            const languagesStudied = Object.values(languageStats).filter(lang => lang.learnedWords > 0).length;
            const totalSections = Object.values(languageStats).reduce((sum, lang) => sum + lang.totalSections, 0);

            setUserStats({
              totalWordsLearned,
              sectionsCompleted: totalSectionsCompleted,
              currentStreak: profileData?.user?.currentStreak || 0,
              longestStreak: profileData?.user?.longestStreak || 0,
              languagesStudied,
              totalSections
            });
          }
        } catch (err) {
          console.error('Failed to fetch profile data:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchProfileData();
  }, [session]);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Profile update failed.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'loading' || loading || status === 'unauthenticated') {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="lg" />
      </Container>
    );
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'grape';
    if (streak >= 14) return 'green';
    if (streak >= 7) return 'orange';
    if (streak >= 3) return 'blue';
    return 'gray';
  };

  const getStreakMessage = (current: number, longest: number) => {
    if (current === 0) return "Start your learning streak today! 🚀";
    if (current === longest && current >= 7) return "🔥 You're on your longest streak ever!";
    if (current >= 30) return "🏆 Amazing dedication! You're a language learning champion!";
    if (current >= 14) return "💪 Two weeks strong! Keep it up!";
    if (current >= 7) return "🌟 One week streak! You're building great habits!";
    return "📈 Great start! Keep building momentum!";
  };

  return (
    <Container size="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Group mb="xs">
            <Button 
              variant="subtle" 
              size="sm" 
              component={Link} 
              href="/dashboard"
            >
              ← Back to Dashboard
            </Button>
          </Group>
          <Title order={1}>Your Profile 👤</Title>
          <Text size="lg" c="dimmed">Track your progress and manage your account</Text>
        </div>
      </Group>

      <Grid>
        {/* Left Column - Learning Overview */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          {/* Overall Stats */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #667eea20, #764ba220)' }}>
              <Group mb="xs">
                <IconBooks size={24} />
                <Text size="xs" c="dimmed">WORDS</Text>
              </Group>
              <Text size="2rem" fw={700} c="blue">{userStats?.totalWordsLearned || 0}</Text>
              <Text size="xs" c="dimmed">Total learned</Text>
            </Card>
            
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #11998e20, #38ef7d20)' }}>
              <Group mb="xs">
                <IconTrophy size={24} />
                <Text size="xs" c="dimmed">SECTIONS</Text>
              </Group>
              <Text size="2rem" fw={700} c="green">{userStats?.sectionsCompleted || 0}</Text>
              <Text size="xs" c="dimmed">Completed</Text>
            </Card>
            
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #ff930020, #ff658020)' }}>
              <Group mb="xs">
                <IconFlame size={24} />
                <Text size="xs" c="dimmed">STREAK</Text>
              </Group>
              <Text size="2rem" fw={700} c={getStreakColor(userStats?.currentStreak || 0)}>{userStats?.currentStreak || 0}</Text>
              <Text size="xs" c="dimmed">Days in a row</Text>
            </Card>
            
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #8E44AD20, #3498DB20)' }}>
              <Group mb="xs">
                <IconGlobe size={24} />
                <Text size="xs" c="dimmed">LANGUAGES</Text>
              </Group>
              <Text size="2rem" fw={700} c="purple">{userStats?.languagesStudied || 0}</Text>
              <Text size="xs" c="dimmed">Studying</Text>
            </Card>
          </SimpleGrid>

          {/* Learning Streak */}
          <Paper withBorder p="lg" radius="md" mb="lg" style={{ background: 'linear-gradient(135deg, #667eea10, #764ba210)' }}>
            <Group justify="space-between" mb="md">
              <Title order={3}>Learning Streak 🔥</Title>
              <Badge 
                size="xl" 
                color={getStreakColor(userStats?.currentStreak || 0)}
                style={{ fontSize: '1.1rem', padding: '8px 16px' }}
              >
                {userStats?.currentStreak || 0} days
              </Badge>
            </Group>
            
            <Text size="lg" mb="md" style={{ textAlign: 'center' }}>
              {getStreakMessage(userStats?.currentStreak || 0, userStats?.longestStreak || 0)}
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
              <Card shadow="xs" padding="md" radius="md" withBorder>
                <Group mb="xs">
                  <Text size="2rem">🔥</Text>
                  <div>
                    <Text size="sm" c="dimmed">Current Streak</Text>
                    <Text size="xl" fw={700}>{userStats?.currentStreak || 0}</Text>
                  </div>
                </Group>
              </Card>
              
              <Card shadow="xs" padding="md" radius="md" withBorder>
                <Group mb="xs">
                  <Text size="2rem">🏆</Text>
                  <div>
                    <Text size="sm" c="dimmed">Longest Streak</Text>
                    <Text size="xl" fw={700}>{userStats?.longestStreak || 0}</Text>
                  </div>
                </Group>
              </Card>
            </SimpleGrid>
          </Paper>

          {/* Language Progress */}
          {languageProgress.length > 0 && (
            <Paper withBorder p="lg" radius="md" mb="lg">
              <Title order={3} mb="md">Your Languages 🌍</Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                {languageProgress.map((lang) => (
                  <Card
                    key={lang.languageCode}
                    shadow="xs"
                    padding="md"
                    radius="md"
                    withBorder
                    component={Link}
                    href={`/learn/${lang.languageCode}/sections`}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <Group justify="space-between" mb="xs">
                      <div>
                        <Group gap="xs">
                          <Text fw={500}>{lang.languageName}</Text>
                          <Text size="lg">{SUPPORTED_LANGUAGES[lang.languageCode].flag}</Text>
                        </Group>
                        <Text size="sm" c="dimmed" style={{ direction: lang.isRTL ? 'rtl' : 'ltr' }}>
                          {lang.nativeName}
                        </Text>
                      </div>
                      <Group gap="xs">
                        <Badge color="blue" variant="light">
                          {Math.round(lang.progress)}%
                        </Badge>
                        <IconChevronRight size={16} />
                      </Group>
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

          {/* Quick Actions */}
          <Paper withBorder p="lg" radius="md">
            <Title order={3} mb="md">Quick Actions 🚀</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Button 
                size="lg" 
                component={Link} 
                href="/"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                🌍 Choose Language
              </Button>
              <Button 
                size="lg" 
                variant="light" 
                component={Link} 
                href="/dashboard"
              >
                📊 View Dashboard
              </Button>
            </SimpleGrid>
          </Paper>
        </Grid.Col>

        {/* Right Column - Profile Settings */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="lg" radius="md">
            <Title order={3} mb="md">Account Settings ⚙️</Title>
            
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => setUsername(event.currentTarget.value)}
                  required
                />
                
                <TextInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  required
                />

                {error && (
                  <Alert color="red" variant="light">
                    ❌ {error}
                  </Alert>
                )}

                {success && (
                  <Alert color="green" variant="light">
                    {success}
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  fullWidth 
                  size="md"
                  style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}
                >
                  💾 Update Profile
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* Platform Summary */}
          <Paper withBorder p="lg" radius="md" mt="lg">
            <Title order={4} mb="md">Learning Summary 📈</Title>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">Total Words</Text>
                <Badge color="blue">{userStats?.totalWordsLearned || 0}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Sections Done</Text>
                <Badge color="green">{userStats?.sectionsCompleted || 0}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Active Languages</Text>
                <Badge color="purple">{userStats?.languagesStudied || 0}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Available Sections</Text>
                <Badge color="orange">{userStats?.totalSections || 0}</Badge>
              </Group>
            </Stack>
          </Paper>

          {/* Study Tip */}
          <Alert color="blue" variant="light" mt="lg">
            <Text fw={500} mb="xs">💡 Study Tip</Text>
            <Text size="sm">
              Try studying multiple languages to boost your learning and maintain daily streaks across all your chosen languages!
            </Text>
          </Alert>
        </Grid.Col>
      </Grid>
    </Container>
  );
}