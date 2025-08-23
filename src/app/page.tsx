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
      title: 'Smart Learning',
      description: 'AI-powered spaced repetition for optimal retention',
      color: 'blue'
    },
    {
      icon: IconWorld,
      title: 'Multi-Language',
      description: 'Learn 9 languages with native content and cultural context',
      color: 'green'
    },
    {
      icon: IconTrophy,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics',
      color: 'yellow'
    },
    {
      icon: IconUsers,
      title: 'Global Community',
      description: 'Join millions of learners worldwide in your journey',
      color: 'grape'
    }
  ];

  const stats = [
    { label: 'Languages Available', value: '9', icon: '🌍' },
    { label: 'Words Available', value: '1000+', icon: '📚' },
    { label: 'Active Learners', value: '1M+', icon: '👥' },
    { label: 'Success Rate', value: '95%', icon: '🎯' }
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
                    ✨ AI-Powered Multi-Language Learning
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
                    Master Languages with
                    <br />
                    <span style={{
                      background: 'linear-gradient(135deg, #3B82F6, #A855F7, #22C55E)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Smart Flashcards
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
                    Transform your language learning journey with our intelligent flashcard system.
                    Choose from 9 languages, upload custom Excel files, leverage AI-powered spaced repetition,
                    and track your progress with detailed analytics.
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
                    Choose Your Language
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
              Why Our Platform Works 🚀
            </Title>
            <Text size="xl" c="dimmed" style={{ maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              Our platform combines the best of traditional learning with cutting-edge AI technology
              to deliver proven results for millions of learners worldwide.
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
              Ready to Master Any Language? 🎯
            </Title>
            <Text size="lg" c="dimmed" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Join millions of learners who have already improved their vocabulary across 9 languages
              with our proven AI-powered flashcard system.
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
                  Choose Language
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
