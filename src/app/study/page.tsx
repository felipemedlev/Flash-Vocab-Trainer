'use client';

import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Button, Paper, Text, Title } from '@mantine/core';
import Link from 'next/link';

function StudyPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get('sectionId');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // If no sectionId is provided, show section selector
  if (!sectionId && status === 'authenticated') {
    return (
      <Container size="md" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <Paper withBorder p="xl" radius="md">
          <Text size="4rem" mb="md">📚</Text>
          <Title order={2} mb="md">Choose a Section to Study</Title>
          <Text size="lg" c="dimmed" mb="xl">
            Select a section from your available courses to begin your Hebrew learning session.
          </Text>
          <Button 
            size="lg" 
            component={Link} 
            href="/sections"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            🚀 Browse Sections
          </Button>
        </Paper>
      </Container>
    );
  }

  if (status === 'loading') {
    return (
      <Container style={{ textAlign: 'center', marginTop: '20vh' }}>
        <Text>Loading study setup...</Text>
      </Container>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  // Handle redirect when sectionId is provided
  useEffect(() => {
    if (sectionId && status === 'authenticated') {
      router.replace(`/study/${sectionId}`);
    }
  }, [sectionId, status, router]);

  // Show loading while redirecting
  if (sectionId && status === 'authenticated') {
    return (
      <Container style={{ textAlign: 'center', marginTop: '20vh' }}>
        <Text>Redirecting to study session...</Text>
      </Container>
    );
  }

  return null;
}

export default function StudySetupPage() {
  return (
    <Suspense fallback={
      <Container style={{ textAlign: 'center', marginTop: '20vh' }}>
        <Text>Loading study setup...</Text>
      </Container>
    }>
      <StudyPageContent />
    </Suspense>
  );
}