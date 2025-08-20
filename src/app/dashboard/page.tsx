'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Title, Grid, Paper, Text, Loader } from '@mantine/core';

const ProgressChart = dynamic(() => import('./components/ProgressChart'), {
  ssr: false,
});

interface DashboardData {
  wordsLearned: number;
  sectionsCompleted: number;
  studyStreak: number;
}

export default function DashboardPage() {
  const { data: _session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/dashboard');
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          const data = await response.json();
          setDashboardData(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader />
      </Container>
    );
  }

  if (status === 'authenticated' && dashboardData) {
    return (
      <Container>
        <Title order={2} style={{ marginBottom: '20px' }}>
          Dashboard
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xl" fw={500}>
                Words Learned
              </Text>
              <Text size="xl">{dashboardData.wordsLearned}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xl" fw={500}>
                Sections Completed
              </Text>
              <Text size="xl">{dashboardData.sectionsCompleted}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xl" fw={500}>
                Study Streak
              </Text>
              <Text size="xl">{dashboardData.studyStreak} days</Text>
            </Paper>
          </Grid.Col>
        </Grid>
        <div style={{ marginTop: '40px' }}>
          <ProgressChart />
        </div>
      </Container>
    );
  }

  return null;
}