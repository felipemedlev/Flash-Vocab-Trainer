'use client';

import {
  Card,
  Group,
  Text,
  Badge,
  SimpleGrid,
  Stack,
  Paper,
  Title,
  Button,
  Progress,
  Box,
  Center
} from '@mantine/core';
import { IconTrendingUp, IconUsers, IconStar, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { SUPPORTED_LANGUAGES, type LanguageConfig } from '@/config/languages';
import { LanguageDisplay } from './LanguageText';
import { useSession } from 'next-auth/react';

interface LanguageStats {
  code: string;
  totalSections: number;
  totalWords: number;
  learnedWords: number;
  popularityScore: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface LanguageSelectorProps {
  userStats?: Record<string, LanguageStats>;
  showUserProgress?: boolean;
}

export function LanguageSelector({ 
  userStats = {}, 
  showUserProgress = true 
}: LanguageSelectorProps) {
  const { data: session } = useSession();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'orange';
      case 'advanced': return 'red';
      default: return 'blue';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      default: return '📚';
    }
  };

  const getPopularityBadge = (code: string) => {
    const popularLanguages = ['es', 'fr', 'de', 'it'];
    const trendingLanguages = ['zh', 'ja', 'ru'];
    
    if (popularLanguages.includes(code)) {
      return <Badge color="blue" variant="light" size="sm">Popular</Badge>;
    }
    if (trendingLanguages.includes(code)) {
      return <Badge color="violet" variant="light" size="sm">Trending</Badge>;
    }
    return null;
  };

  const languages = Object.values(SUPPORTED_LANGUAGES).filter(lang => lang.isActive);

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box ta="center">
        <Title order={1} size="h1" mb="md">
          Choose Your Language Journey 🌍
        </Title>
        <Text size="lg" c="dimmed" maw={600} mx="auto">
          Select a language to start or continue your learning adventure. 
          Each language is carefully designed with native content and cultural context.
        </Text>
      </Box>

      {/* Language Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {languages.map((language) => {
          const stats = userStats[language.code];
          const hasProgress = stats && stats.learnedWords > 0;
          const progressPercentage = stats ? (stats.learnedWords / stats.totalWords) * 100 : 0;

          return (
            <Card
              key={language.code}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              component={Link}
              href={session ? `/learn/${language.code}/sections` : '/auth/login'}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="language-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Background gradient based on language */}
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `linear-gradient(135deg, ${language.isRTL ? '#667eea20' : '#764ba220'}, transparent)`,
                  borderRadius: '0 0 0 100px',
                }}
              />

              <Stack gap="sm" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header with flag and name */}
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm">
                    <Text size="2rem" style={{ lineHeight: 1 }}>
                      {language.flag}
                    </Text>
                    <div>
                      <LanguageDisplay
                        language={language.code}
                        showFlag={false}
                        showNativeName={true}
                        size="lg"
                      />
                    </div>
                  </Group>
                  <IconChevronRight size={20} style={{ opacity: 0.6 }} />
                </Group>

                {/* Badges */}
                <Group gap="xs">
                  <Badge
                    color={getDifficultyColor(language.difficulty || 'beginner')}
                    variant="light"
                    size="sm"
                    leftSection={getDifficultyIcon(language.difficulty || 'beginner')}
                  >
                    {language.difficulty || 'Beginner'}
                  </Badge>
                  {getPopularityBadge(language.code)}
                  {language.features?.hasTones && (
                    <Badge color="purple" variant="light" size="sm">Tonal</Badge>
                  )}
                  {language.isRTL && (
                    <Badge color="cyan" variant="light" size="sm">RTL</Badge>
                  )}
                </Group>

                {/* Features */}
                <Group gap="xs" style={{ fontSize: '0.75rem' }}>
                  {language.features?.hasAudio && (
                    <Text size="xs" c="dimmed">🔊 Audio</Text>
                  )}
                  {language.features?.hasRomanization && (
                    <Text size="xs" c="dimmed">🔤 Romanization</Text>
                  )}
                  {language.features?.hasGender && (
                    <Text size="xs" c="dimmed">⚥ Gendered</Text>
                  )}
                </Group>

                {/* User Progress (if logged in and has progress) */}
                {session && showUserProgress && hasProgress && (
                  <Paper withBorder p="xs" bg="gray.0">
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>Your Progress</Text>
                        <Text size="sm" c="dimmed">
                          {Math.round(progressPercentage)}%
                        </Text>
                      </Group>
                      <Progress
                        value={progressPercentage}
                        color="blue"
                        size="sm"
                        radius="md"
                      />
                      <Text size="xs" c="dimmed">
                        {stats.learnedWords} / {stats.totalWords} words learned
                      </Text>
                    </Stack>
                  </Paper>
                )}

                {/* Stats for new users */}
                {(!session || !hasProgress) && (
                  <Paper withBorder p="xs" bg="gray.0">
                    <Group justify="space-around">
                      <Center>
                        <Stack gap={0} align="center">
                          <Text size="lg" fw={700} c="blue">
                            {stats?.totalSections || '5+'}
                          </Text>
                          <Text size="xs" c="dimmed">Sections</Text>
                        </Stack>
                      </Center>
                      <Center>
                        <Stack gap={0} align="center">
                          <Text size="lg" fw={700} c="green">
                            {stats?.totalWords || '100+'}
                          </Text>
                          <Text size="xs" c="dimmed">Words</Text>
                        </Stack>
                      </Center>
                    </Group>
                  </Paper>
                )}

                {/* Call to action */}
                <Button
                  variant="light"
                  fullWidth
                  rightSection={<IconChevronRight size={16} />}
                  style={{
                    backgroundColor: hasProgress ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-green-light)',
                  }}
                >
                  {hasProgress ? 'Continue Learning' : 'Start Learning'}
                </Button>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Additional Info */}
      <Paper withBorder p="lg" radius="md" bg="gray.0">
        <Group justify="center" gap="xl">
          <Group gap="sm">
            <IconUsers size={20} color="var(--mantine-color-blue-6)" />
            <div>
              <Text size="sm" fw={500}>1M+ Learners</Text>
              <Text size="xs" c="dimmed">Join our community</Text>
            </div>
          </Group>
          <Group gap="sm">
            <IconStar size={20} color="var(--mantine-color-yellow-6)" />
            <div>
              <Text size="sm" fw={500}>4.9/5 Rating</Text>
              <Text size="xs" c="dimmed">Highly rated method</Text>
            </div>
          </Group>
          <Group gap="sm">
            <IconTrendingUp size={20} color="var(--mantine-color-green-6)" />
            <div>
              <Text size="sm" fw={500}>Proven Results</Text>
              <Text size="xs" c="dimmed">AI-powered learning</Text>
            </div>
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}