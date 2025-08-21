'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
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
} from '@mantine/core';
import Link from 'next/link';

interface UserStats {
  totalWordsLearned: number;
  sectionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  studyDays: number;
  averageSessionLength: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      if (session?.user) {
        setUsername(session.user.name || '');
        setEmail(session.user.email || '');

        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const data = await response.json();
            setUserStats({
              totalWordsLearned: data.user.currentStreak, // This should be updated in API
              sectionsCompleted: 0, // This should be updated in API
              currentStreak: data.user.currentStreak,
              longestStreak: data.user.longestStreak,
              studyDays: 0, // This should be updated in API
              averageSessionLength: 0 // This should be updated in API
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

  if (status === 'loading' || loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="lg" />
      </Container>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Container>
        <Alert color="red">
          🔒 Access Denied - Please log in to view your profile
        </Alert>
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
    if (current === longest && current >= 7) return "🔥 You&apos;re on your longest streak ever!";
    if (current >= 30) return "🏆 Amazing dedication! You&apos;re a Hebrew master!";
    if (current >= 14) return "💪 Two weeks strong! Keep it up!";
    if (current >= 7) return "🌟 One week streak! You&apos;re building great habits!";
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
        {/* Left Column - Stats & Achievements */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          {/* Streak Section */}
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

          {/* Achievement Badges */}
          <Paper withBorder p="lg" radius="md" mb="lg">
            <Title order={3} mb="md">Achievements 🎯</Title>
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
              <div style={{ textAlign: 'center' }}>
                <Text size="3rem" mb="xs">
                  {(userStats?.currentStreak || 0) >= 7 ? '🔥' : '⭐'}
                </Text>
                <Text size="sm" fw={500}>Week Warrior</Text>
                <Text size="xs" c="dimmed">
                  {(userStats?.currentStreak || 0) >= 7 ? 'Unlocked!' : '7 day streak'}
                </Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Text size="3rem" mb="xs">
                  {(userStats?.longestStreak || 0) >= 30 ? '👑' : '🏅'}
                </Text>
                <Text size="sm" fw={500}>Month Master</Text>
                <Text size="xs" c="dimmed">
                  {(userStats?.longestStreak || 0) >= 30 ? 'Unlocked!' : '30 day streak'}
                </Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Text size="3rem" mb="xs">📚</Text>
                <Text size="sm" fw={500}>First Steps</Text>
                <Text size="xs" c="dimmed">Started learning</Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Text size="3rem" mb="xs">
                  {(userStats?.currentStreak || 0) >= 100 ? '🚀' : '🌟'}
                </Text>
                <Text size="sm" fw={500}>Century Club</Text>
                <Text size="xs" c="dimmed">
                  {(userStats?.currentStreak || 0) >= 100 ? 'Unlocked!' : '100 day streak'}
                </Text>
              </div>
            </SimpleGrid>
          </Paper>

          {/* Quick Actions */}
          <Paper withBorder p="lg" radius="md">
            <Title order={3} mb="md">Quick Actions 🚀</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Button 
                size="lg" 
                component={Link} 
                href="/sections"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                📖 Continue Learning
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

          {/* Study Stats */}
          <Paper withBorder p="lg" radius="md" mt="lg">
            <Title order={4} mb="md">Study Statistics 📈</Title>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">Total Study Days</Text>
                <Badge color="blue">{userStats?.studyDays || 0}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Words Learned</Text>
                <Badge color="green">{userStats?.totalWordsLearned || 0}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Sections Completed</Text>
                <Badge color="purple">{userStats?.sectionsCompleted || 0}</Badge>
              </Group>
            </Stack>
          </Paper>

          {/* Motivational Message */}
          <Alert color="blue" variant="light" mt="lg">
            <Text fw={500} mb="xs">💡 Pro Tip</Text>
            <Text size="sm">
              Study for just 10 minutes daily to maintain your streak and see consistent progress!
            </Text>
          </Alert>
        </Grid.Col>
      </Grid>
    </Container>
  );
}