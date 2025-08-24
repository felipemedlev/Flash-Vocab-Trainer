'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
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
  Select,
  Tabs,
  ScrollArea,
  Divider,
  ActionIcon,
  Tooltip,
  Pagination,
} from '@mantine/core';
import { 
  IconGlobe, 
  IconBooks, 
  IconTrophy, 
  IconFlame, 
  IconChevronRight, 
  IconSearch,
  IconFilter,
  IconBrain,
  IconAlertTriangle,
  IconCheck,
  IconRefresh,
  IconTarget
} from '@tabler/icons-react';
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

interface SectionData {
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

interface UserWord {
  id: number;
  wordId: number;
  originalText: string;
  translationText: string;
  pronunciation?: string;
  language: {
    code: string;
    name: string;
    nativeName: string;
    isRTL: boolean;
    fontFamily?: string;
  };
  section: {
    id: number;
    name: string;
  };
  stats: {
    correctCount: number;
    incorrectCount: number;
    consecutiveCorrect: number;
    timesSeen: number;
    accuracy: number;
    isLearned: boolean;
    isDifficult: boolean;
    isManuallyLearned: boolean;
    lastSeen?: Date;
    nextReviewDate: Date;
    easinessFactor: number;
    interval: number;
    repetition: number;
  };
}

interface UserWordsResponse {
  words: UserWord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: {
    totalWords: number;
    learnedWords: number;
    difficultWords: number;
    averageAccuracy: number;
  };
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
  
  // Words progress states
  const [userWords, setUserWords] = useState<UserWordsResponse | null>(null);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [wordsFilter, setWordsFilter] = useState<'all' | 'learned' | 'difficult'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 20;

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
              const langSections = allSections.filter((s: SectionData) => s.language.code === langCode);
              
              const totalWords = langSections.reduce((sum: number, s: SectionData) => sum + s.totalWords, 0);
              const learnedWords = langSections.reduce((sum: number, s: SectionData) => sum + s.learnedWords, 0);
              const sectionsCompleted = langSections.filter((s: SectionData) => s.learnedWords === s.totalWords && s.totalWords > 0).length;
              
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

  // Fetch user words data
  const fetchUserWords = useCallback(async () => {
    if (!session?.user) return;
    
    setWordsLoading(true);
    setError('');
    
    // Add a client-side timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const params = new URLSearchParams({
        type: wordsFilter,
        limit: wordsPerPage.toString(),
        offset: ((currentPage - 1) * wordsPerPage).toString(),
      });
      
      if (languageFilter) params.set('language', languageFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      
      console.log('Fetching words with params:', params.toString());
      
      // Use the optimized endpoint
      const response = await fetch(`/api/user-words-simple?${params}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setUserWords(data);
        setError('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch user words:', err);
      
      const error = err as Error;
      if (error.name === 'AbortError') {
        setError('Request timed out. Try filtering by language or using search to narrow results.');
      } else {
        setError(error.message || 'Failed to load words. Please try again.');
      }
      
      // Set empty results on error
      setUserWords({
        words: [],
        pagination: { total: 0, limit: wordsPerPage, offset: 0, hasMore: false },
        summary: { totalWords: 0, learnedWords: 0, difficultWords: 0, averageAccuracy: 0 }
      });
    } finally {
      setWordsLoading(false);
    }
  }, [session?.user, wordsFilter, languageFilter, searchQuery, currentPage, wordsPerPage]);

  // Fetch words when tab becomes active or filters change
  useEffect(() => {
    if (activeTab === 'words' && session?.user) {
      fetchUserWords();
    }
  }, [activeTab, fetchUserWords, session?.user]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [wordsFilter, languageFilter, searchQuery]);

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

  // Helper function to render word cards
  const renderWordCard = (word: UserWord) => {
    const { stats, originalText, translationText, pronunciation, language, section } = word;
    
    return (
      <Card key={word.id} shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <div style={{ flex: 1 }}>
            <Group gap="xs" mb={4}>
              <Text 
                fw={500} 
                size="lg"
                style={{ 
                  direction: language.isRTL ? 'rtl' : 'ltr',
                  fontFamily: language.fontFamily || 'inherit'
                }}
              >
                {originalText}
              </Text>
              {pronunciation && (
                <Text size="sm" c="dimmed" fs="italic">
                  [{pronunciation}]
                </Text>
              )}
            </Group>
            <Text size="md" c="blue" mb="xs">{translationText}</Text>
            <Group gap="xs">
              <Badge size="xs" variant="light" color="gray">
                {language.name}
              </Badge>
              <Badge size="xs" variant="light">
                {section.name}
              </Badge>
            </Group>
          </div>
          <Stack align="center" gap="xs">
            {stats.isLearned && (
              <Tooltip label="Mastered">
                <IconCheck size={20} color="green" />
              </Tooltip>
            )}
            {stats.isDifficult && !stats.isLearned && (
              <Tooltip label="Needs practice">
                <IconAlertTriangle size={20} color="orange" />
              </Tooltip>
            )}
            <Badge 
              color={stats.accuracy >= 80 ? 'green' : stats.accuracy >= 60 ? 'yellow' : 'red'}
              variant="filled"
              size="sm"
            >
              {stats.accuracy}%
            </Badge>
          </Stack>
        </Group>
        
        <Divider my="xs" />
        
        <SimpleGrid cols={4} spacing="xs">
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Seen</Text>
            <Text size="sm" fw={500}>{stats.timesSeen}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Correct</Text>
            <Text size="sm" fw={500} c="green">{stats.correctCount}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Wrong</Text>
            <Text size="sm" fw={500} c="red">{stats.incorrectCount}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Streak</Text>
            <Text size="sm" fw={500} c="blue">{stats.consecutiveCorrect}</Text>
          </div>
        </SimpleGrid>
      </Card>
    );
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

      {/* Main Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconTrophy size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="words" leftSection={<IconBrain size={16} />}>
            Words Progress
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
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
        </Tabs.Panel>

        <Tabs.Panel value="words" pt="md">
          {/* Words Progress Tab */}
          <Stack gap="lg">
            {/* Summary Cards */}
            {userWords?.summary && (
              <SimpleGrid cols={{ base: 2, sm: 4 }} mb="md">
                <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
                  <IconBooks size={24} style={{ margin: '0 auto', marginBottom: '8px' }} color="#667eea" />
                  <Text size="xl" fw={700} c="blue">{userWords.summary.totalWords}</Text>
                  <Text size="sm" c="dimmed">Total Studied</Text>
                </Card>
                <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
                  <IconCheck size={24} style={{ margin: '0 auto', marginBottom: '8px' }} color="#38ef7d" />
                  <Text size="xl" fw={700} c="green">{userWords.summary.learnedWords}</Text>
                  <Text size="sm" c="dimmed">Mastered</Text>
                </Card>
                <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
                  <IconAlertTriangle size={24} style={{ margin: '0 auto', marginBottom: '8px' }} color="#ff9f43" />
                  <Text size="xl" fw={700} c="orange">{userWords.summary.difficultWords}</Text>
                  <Text size="sm" c="dimmed">Need Practice</Text>
                </Card>
                <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: 'center' }}>
                  <IconTarget size={24} style={{ margin: '0 auto', marginBottom: '8px' }} color="#667eea" />
                  <Text size="xl" fw={700} c="blue">{userWords.summary.averageAccuracy}%</Text>
                  <Text size="sm" c="dimmed">Avg. Accuracy</Text>
                </Card>
              </SimpleGrid>
            )}

            {/* Filters and Search */}
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" mb="md">
                <Title order={4}>Your Vocabulary 📚</Title>
                <ActionIcon 
                  onClick={fetchUserWords} 
                  loading={wordsLoading}
                  variant="subtle"
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Group>
              
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Select
                    label="Filter by status"
                    placeholder="All words"
                    value={wordsFilter}
                    onChange={(value: string | null) => setWordsFilter((value as 'all' | 'learned' | 'difficult') || 'all')}
                    data={[
                      { value: 'all', label: '📚 All Words' },
                      { value: 'learned', label: '✅ Mastered Words' },
                      { value: 'difficult', label: '⚠️ Need Practice' }
                    ]}
                    leftSection={<IconFilter size={16} />}
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Select
                    label="Filter by language"
                    placeholder="All languages"
                    value={languageFilter}
                    onChange={(value: string | null) => setLanguageFilter(value || '')}
                    data={[
                      { value: '', label: '🌍 All Languages' },
                      ...Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => ({
                        value: code,
                        label: `${lang.flag} ${lang.name}`
                      }))
                    ]}
                    leftSection={<IconGlobe size={16} />}
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="Search words"
                    placeholder="Search original or translation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftSection={<IconSearch size={16} />}
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Error Message */}
            {error && (
              <Alert color="red" variant="light" mb="md">
                <Text fw={500} mb="xs">⚠️ Loading Error</Text>
                <Text size="sm">{error}</Text>
              </Alert>
            )}

            {/* Words List */}
            {wordsLoading ? (
              <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Stack align="center">
                  <Loader size="md" />
                  <Text size="sm" c="dimmed">Loading your words...</Text>
                </Stack>
              </Container>
            ) : userWords?.words.length === 0 ? (
              <Paper withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
                <Text size="4rem" mb="md">📖</Text>
                <Title order={3} mb="xs">No words found</Title>
                <Text c="dimmed" mb="md">
                  {wordsFilter === 'all' 
                    ? "Start studying to see your vocabulary progress here!"
                    : wordsFilter === 'learned'
                    ? "Keep studying to master more words!"
                    : "Great job! No difficult words found with current filters."
                  }
                </Text>
                <Button 
                  component={Link} 
                  href="/languages" 
                  variant="light"
                >
                  Start Studying
                </Button>
              </Paper>
            ) : (
              <>
                <ScrollArea style={{ height: '60vh' }}>
                  <Stack gap="md">
                    {userWords?.words.map(renderWordCard)}
                  </Stack>
                </ScrollArea>

                {/* Pagination */}
                {userWords && userWords.pagination.total > wordsPerPage && (
                  <Group justify="center" mt="md">
                    <Pagination
                      value={currentPage}
                      onChange={setCurrentPage}
                      total={Math.ceil(userWords.pagination.total / wordsPerPage)}
                      size="sm"
                    />
                    <Text size="sm" c="dimmed">
                      Showing {((currentPage - 1) * wordsPerPage) + 1} - {Math.min(currentPage * wordsPerPage, userWords.pagination.total)} of {userWords.pagination.total} words
                    </Text>
                  </Group>
                )}
              </>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}