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
} from '@mantine/core';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    async function fetchProfileData() {
      if (session?.user) {
        setUsername(session.user.name || '');
        setEmail(session.user.email || '');

        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const data = await response.json();
            setCurrentStreak(data.user.currentStreak);
            setLongestStreak(data.user.longestStreak);
          }
        } catch (err) {
          console.error('Failed to fetch profile data:', err);
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
        setSuccess(data.message);
      } else {
        setError(data.message || 'Profile update failed.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader />
      </Container>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  return (
    <Container>
      <Title order={2} style={{ marginBottom: '20px' }}>
        User Profile
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Text size="xl" fw={500}>
              Current Streak
            </Text>
            <Text size="xl">{currentStreak}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Text size="xl" fw={500}>
              Longest Streak
            </Text>
            <Text size="xl">{longestStreak}</Text>
          </Paper>
        </Grid.Col>
      </Grid>
      <Paper withBorder p="md" radius="md" style={{ marginTop: '20px' }}>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
            required
          />
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            style={{ marginTop: '20px' }}
          />
          {error && (
            <Alert color="red" style={{ marginTop: '20px' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert color="green" style={{ marginTop: '20px' }}>
              {success}
            </Alert>
          )}
          <Button type="submit" style={{ marginTop: '20px' }}>
            Update Profile
          </Button>
        </form>
      </Paper>
    </Container>
  );
}