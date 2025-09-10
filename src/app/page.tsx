'use client';

import {
  Title,
  Text,
  Button,
  Container,
  Group,
  Stack,
  Paper,
  SimpleGrid,
  Card,
  ThemeIcon,
  rem,
  Box,
  Center
} from '@mantine/core';
import {
  IconBrain,
  IconTrophy,
  IconUsers,
  IconRocket,
  IconTarget,
  IconCheck,
  IconWorld
} from '@tabler/icons-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  const features = [
    {
      icon: IconBrain,
      title: 'Custom Vocabulary Builder',
      description: 'Create personalized word collections and upload your own Excel/CSV files',
      color: 'blue'
    },
    {
      icon: IconWorld,
      title: '11 Languages Supported',
      description: 'Comprehensive vocabulary management for Hebrew, Arabic, Spanish, and 8 more languages',
      color: 'green'
    },
    {
      icon: IconTrophy,
      title: 'Multiple Study Modes',
      description: 'Practice with flashcards, browse word lists, and track mastery progress',
      color: 'yellow'
    },
    {
      icon: IconUsers,
      title: 'Smart Organization',
      description: 'Organize words by sections, difficulty, and learning status with advanced filtering',
      color: 'grape'
    }
  ];

  const stats = [
    { label: 'Languages Supported', value: '11', icon: '🌍' },
    { label: 'Study Methods', value: '3+', icon: '📚' },
    { label: 'Custom Uploads', value: 'Unlimited', icon: '📁' },
    { label: 'Progress Tracking', value: 'Advanced', icon: '📊' }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Container size="xl">
        <Center>
          <Stack align="center" gap="l" style={{ textAlign: 'center', maxWidth: '900px', width: '100%' }}>
                <Box style={{ width: '100%' }}>
                  {/* Subtitle badge */}
                  <Box
                    mb="lg"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0px 24px',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '50px',
                      backdropFilter: 'blur(10px)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#3B82F6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    ✨ Complete Vocabulary Learning Platform
                  </Box>

                  <Title
                    order={1}
                    mb="lg"
                    style={{
                      color: '#1F2937',
                      fontWeight: 900,
                      lineHeight: 1.1,
                      textAlign: 'center',
                      fontSize: 'clamp(2.8rem, 6vw, 4.2rem)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Build Your Vocabulary
                    <br />
                    <span style={{
                      background: 'linear-gradient(135deg, #3B82F6, #A855F7, #22C55E)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Your Way
                    </span>
                  </Title>

                  <Text
                    size="xl"
                    mb="xl"
                    style={{
                      color: '#6B7280',
                      maxWidth: '750px',
                      lineHeight: 1.7,
                      fontWeight: 400,
                      margin: '0 auto',
                      textAlign: 'center',
                      padding: '0 1rem',
                      fontSize: 'clamp(1.1rem, 2.8vw, 1.35rem)'
                    }}
                  >
                    Create custom vocabulary collections, organize words by sections, practice with multiple study modes, 
                    and track your learning progress. Upload your own Excel/CSV files or browse pre-loaded content 
                    across 11 languages with intelligent spaced repetition.
                  </Text>
                </Box>

                {/* Action Buttons */}
                <Group gap="md" justify="center" style={{ width: '100%', maxWidth: '500px', padding: '0 1rem' }}>
                  <Button
                    component={Link}
                    href="/languages"
                    size="xl"
                    radius="xl"
                    leftSection={<IconWorld size={24} />}
                    style={{
                      background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                      boxShadow: '0 8px 25px rgba(17, 153, 142, 0.3)',
                      fontSize: '18px',
                      padding: '16px 32px',
                      height: '60px'
                    }}
                  >
                    Start Building Vocabulary
                  </Button>

                  {session && (
                    <Button
                      component={Link}
                      href="/dashboard"
                      variant="outline"
                      size="lg"
                      radius="xl"
                      leftSection={<IconTarget size={20} />}
                    >
                      Dashboard
                    </Button>
                  )}
                </Group>
          </Stack>
        </Center>
      </Container>

      {/* Why Choose Us Section */}
      <Container size="xl" py={60}>
        <Stack gap="xl">
          <Box style={{ textAlign: 'center' }}>
            <Title order={2} size={rem(42)} mb="md">
              Complete Vocabulary Management 🚀
            </Title>
            <Text size="xl" c="dimmed" style={{ maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              More than just flashcards - create, organize, study, and track your vocabulary 
              learning with powerful tools designed for serious language learners.
            </Text>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
            {features.map((feature, index) => (
              <Card
                key={index}
                shadow="md"
                padding="xl"
                radius="lg"
                withBorder
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <ThemeIcon
                  size={rem(70)}
                  radius={rem(35)}
                  variant="gradient"
                  gradient={{ deg: 135, from: feature.color, to: feature.color }}
                  mb="lg"
                  style={{ marginLeft: 'auto', marginRight: 'auto' }}
                >
                  <feature.icon size={rem(35)} />
                </ThemeIcon>
                <Text ta="center" fw={600} size="xl" mb="md">
                  {feature.title}
                </Text>
                <Text ta="center" size="md" c="dimmed" style={{ lineHeight: 1.5 }}>
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>


      {/* Stats Section */}
      <Container size="xl" py={10}>
        <Paper
          withBorder
          radius="lg"
          p="xl"
          style={{
            background: 'linear-gradient(135deg, #667eea10, #764ba210)'
          }}
        >
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xl">
            {stats.map((stat, index) => (
              <Box key={index} style={{ textAlign: 'center' }}>
                <Text size="3rem" mb="xs">
                  {stat.icon}
                </Text>
                <Title order={3} size={rem(32)} mb="xs">
                  {stat.value}
                </Title>
                <Text size="sm" c="dimmed">
                  {stat.label}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Paper>
      </Container>

      {/* CTA Section */}
      <Container size="xl" py={30}>
        <Paper
          withBorder
          p="xl"
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, #667eea10, #764ba210)',
            textAlign: 'center'
          }}
        >
          <Stack gap="lg">
            <Title order={2} size={rem(36)}>
              Ready to Build Your Vocabulary? 🎯
            </Title>
            <Text size="lg" c="dimmed" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Start organizing and learning vocabulary your way. Upload your own content, 
              create custom sections, and practice with multiple study methods across 11 languages.
            </Text>
            <Group justify="center" gap="md">
              {session ? (
                <Button
                  component={Link}
                  href="/languages"
                  size="lg"
                  radius="xl"
                  leftSection={<IconCheck size={20} />}
                  style={{
                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                    boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)'
                  }}
                >
                  Start Learning
                </Button>
              ) : (
                <>
                  <Button
                    component={Link}
                    href="/auth/register"
                    size="lg"
                    radius="xl"
                    leftSection={<IconRocket size={20} />}
                    style={{
                      background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                      boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)'
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    component={Link}
                    href="/auth/login"
                    variant="outline"
                    size="lg"
                    radius="xl"
                  >
                    Already have an account?
                  </Button>
                </>
              )}
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
