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
  IconBook,
  IconBrain,
  IconTrophy,
  IconUsers,
  IconRocket,
  IconTarget,
  IconCheck
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
      icon: IconBook,
      title: 'Hebrew Focus',
      description: 'Specialized content for Hebrew language learners',
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
      title: 'Community',
      description: 'Join fellow Hebrew learners in your journey',
      color: 'grape'
    }
  ];

  const stats = [
    { label: 'Words Mastered', value: '100+', icon: '📚' },
    { label: 'Study Sessions', value: '10+', icon: '⏱️' },
    { label: 'Active Learners', value: '500+', icon: '👥' },
    { label: 'Success Rate', value: '95%', icon: '🎯' }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <Box
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />

        <Container size="xl" py={60} style={{ position: 'relative', zIndex: 2, paddingTop: 'clamp(3rem, 6vw, 4rem)', paddingBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <Center>
            <Paper
              withBorder
              radius="lg"
              p="xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                maxWidth: '800px',
                width: '100%'
              }}
            >
              <Stack align="center" gap="xl" style={{ textAlign: 'center' }}>
                <Box style={{ width: '100%' }}>
                  <Title 
                    order={1} 
                    size={rem(56)}
                    mb="lg"
                    style={{ 
                      color: '#ffffff',
                      fontWeight: 800,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      lineHeight: 1.2,
                      textAlign: 'center',
                      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)'
                    }}
                  >
                    Welcome to Ulpan Flashcards
                  </Title>
                  <Text 
                    size="xl"
                    mb="xl"
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.95)',
                      maxWidth: '700px',
                      lineHeight: 1.6,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontWeight: 400,
                      margin: '0 auto',
                      textAlign: 'center',
                      padding: '0 1rem',
                      fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)'
                    }}
                  >
                    Master Hebrew vocabulary with our intelligent flashcard system. 
                    Create custom study sections by uploading your own Excel files, 
                    or use our curated content. Combining traditional learning methods 
                    with modern spaced repetition technology.
                  </Text>
                </Box>

                <Stack gap="lg" align="center" style={{ width: '100%', maxWidth: '550px', padding: '0 1rem' }}>
                {session ? (
                  <>
                    <Button 
                      component={Link} 
                      href="/study" 
                      size="xl" 
                      radius="xl"
                      fullWidth
                      leftSection={<IconRocket size={20} />}
                      style={{ 
                        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                        boxShadow: '0 8px 32px rgba(17, 153, 142, 0.4)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '18px',
                        height: '56px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(17, 153, 142, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(17, 153, 142, 0.4)';
                      }}
                    >
                      🚀 Start Studying
                    </Button>
                    <Group gap="md" style={{ width: '100%' }}>
                      <Button 
                        component={Link} 
                        href="/dashboard" 
                        variant="white" 
                        size="lg" 
                        radius="xl"
                        leftSection={<IconTarget size={18} />}
                        style={{ 
                          flex: 1,
                          color: '#667eea',
                          fontWeight: 600,
                          height: '48px',
                          boxShadow: '0 4px 16px rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        📊 Dashboard
                      </Button>
                      <Button 
                        component={Link} 
                        href="/upload" 
                        variant="white" 
                        size="lg" 
                        radius="xl"
                        leftSection={<IconBook size={18} />}
                        style={{ 
                          flex: 1,
                          color: '#667eea',
                          fontWeight: 600,
                          height: '48px',
                          boxShadow: '0 4px 16px rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        📤 Upload Excel
                      </Button>
                    </Group>
                  </>
                ) : (
                  <>
                    <Button 
                      component={Link} 
                      href="/auth/login" 
                      size="xl" 
                      radius="xl"
                      fullWidth
                      leftSection={<IconRocket size={20} />}
                      style={{ 
                        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                        boxShadow: '0 8px 32px rgba(17, 153, 142, 0.4)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '18px',
                        height: '56px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(17, 153, 142, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(17, 153, 142, 0.4)';
                      }}
                    >
                      🚀 Start Learning Now
                    </Button>
                    <Button 
                      component={Link} 
                      href="/auth/register" 
                      variant="white" 
                      size="lg" 
                      radius="xl"
                      fullWidth
                      leftSection={<IconUsers size={18} />}
                      style={{
                        color: '#667eea',
                        fontWeight: 600,
                        height: '48px',
                        boxShadow: '0 4px 16px rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ✨ Create Free Account
                    </Button>
                  </>
                )}
              </Stack>
              </Stack>
            </Paper>
          </Center>
        </Container>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </Box>

      {/* Features Section */}
      <Container size="xl" py={40}>
        <Paper
          withBorder
          radius="lg"
          p="xl"
          style={{
            background: 'linear-gradient(135deg, #667eea10, #764ba210)'
          }}
        >
          <Stack gap="xl">
            <Box style={{ textAlign: 'center' }}>
              <Title order={2} size={rem(40)} mb="md">
                Why Choose Ulpan Flashcards? 🤔
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
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <ThemeIcon
                  size={rem(60)}
                  radius={rem(30)}
                  variant="gradient"
                  gradient={{ deg: 135, from: feature.color, to: feature.color }}
                  style={{ margin: '0 auto', marginBottom: '1rem' }}
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
        </Paper>
      </Container>

      {/* Stats Section */}
      <Container size="xl" py={40}>
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
      <Container size="xl" py={40}>
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
