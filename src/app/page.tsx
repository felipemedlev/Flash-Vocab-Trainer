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
  Center,
  Tabs
} from '@mantine/core';
import {
  IconBook,
  IconBrain,
  IconTrophy,
  IconUsers,
  IconRocket,
  IconTarget,
  IconCheck,
  IconWorld,
  IconLanguage
} from '@tabler/icons-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useState } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string | null>('languages');

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

                {/* Quick Actions for authenticated users */}
                {session && (
                  <Group gap="md" justify="center" style={{ width: '100%', maxWidth: '500px', padding: '0 1rem' }}>
                    <Button
                      component={Link}
                      href="/dashboard"
                      variant="light"
                      size="lg"
                      radius="xl"
                      leftSection={<IconTarget size={20} />}
                    >
                      Dashboard
                    </Button>
                    <Button
                      component={Link}
                      href="/upload"
                      variant="light"
                      size="lg"
                      radius="xl"
                      leftSection={<IconBook size={20} />}
                    >
                      Upload Content
                    </Button>
                  </Group>
                )}
          </Stack>
        </Center>
      </Container>

      {/* Main Content Tabs */}
      <Container size="xl" py={40}>
        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
          <Tabs.List justify="center" mb="xl">
            <Tabs.Tab 
              value="languages" 
              leftSection={<IconWorld size={18} />}
              style={{ fontSize: '16px', padding: '12px 24px' }}
            >
              Choose Language
            </Tabs.Tab>
            <Tabs.Tab 
              value="features" 
              leftSection={<IconLanguage size={18} />}
              style={{ fontSize: '16px', padding: '12px 24px' }}
            >
              Why Choose Us
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="languages">
            <LanguageSelector />
          </Tabs.Panel>

          <Tabs.Panel value="features">
            {/* Features content will go here */}
            <Stack gap="xl">
              <Box style={{ textAlign: 'center' }}>
                <Title order={2} size={rem(40)} mb="md">
                  Why Choose Our Platform? 🤔
                </Title>
                <Text size="lg" c="dimmed" style={{ maxWidth: '600px', margin: '0 auto' }}>
                  Our platform combines the best of traditional learning with cutting-edge technology
                </Text>
              </Box>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    withBorder
                    style={{
                      background: 'linear-gradient(135deg, rgb(253, 253, 253) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <ThemeIcon
                      size={rem(60)}
                      radius={rem(30)}
                      variant="gradient"
                      gradient={{ deg: 135, from: feature.color, to: feature.color }}
                      mb="md"
                      style={{ marginLeft: 'auto', marginRight: 'auto' }}
                    >
                      <feature.icon size={rem(30)} />
                    </ThemeIcon>
                    <Text ta="center" fw={500} size="lg" mb="sm">
                      {feature.title}
                    </Text>
                    <Text ta="center" size="sm" c="dimmed">
                      {feature.description}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
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
              Ready to Master Hebrew? 🎯
            </Title>
            <Text size="lg" c="dimmed" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Join thousands of learners who have already improved their Hebrew vocabulary
              with our proven flashcard system.
            </Text>
            <Group justify="center" gap="md">
              {session ? (
                <Button
                  component={Link}
                  href="/study"
                  size="lg"
                  radius="xl"
                  leftSection={<IconCheck size={20} />}
                  style={{
                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                    boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)'
                  }}
                >
                  Continue Learning
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
