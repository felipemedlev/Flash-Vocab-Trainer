'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Title,
  Select,
  Radio,
  Button,
  Paper,
  Text,
  Loader,
  Alert,
} from '@mantine/core';

interface Section {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdByUserId: number | null;
  createdAt: string;
  words: any[];
  totalWords: number;
}

export default function StudySetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get('sectionId');
  const { data: _session, status } = useSession();

  const [sectionName, setSectionName] = useState('Loading Section...');
  const [totalWordsInSections, setTotalWordsInSections] = useState(0);
  const [sessionLength, setSessionLength] = useState('10');
  const [studyMode, setStudyMode] = useState<'all' | 'difficult'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSectionDetails = async () => {
      if (!sectionId) {
        router.push('/sections');
        return;
      }
      if (status === 'authenticated') {
        try {
          const response = await fetch(`/api/sections/${sectionId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const currentSection = data.find((s: Section) => s.id === parseInt(sectionId));
          if (currentSection) {
            setSectionName(currentSection.name);
            setTotalWordsInSections(currentSection.totalWords);
          } else {
            setError('Section not found.');
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSectionDetails();
  }, [sectionId, status, router]);

  const estimatedTime = (parseInt(sessionLength) / 10) * 1;

  const handleStartStudy = () => {
    if (sectionId) {
      router.push(
        `/study/flashcard?sectionId=${sectionId}&length=${sessionLength}&mode=${studyMode}`
      );
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert color="red">{error}</Alert>
      </Container>
    );
  }

  if (status === 'authenticated') {
    return (
      <Container>
        <Paper withBorder p="md" radius="md">
          <Title order={2} style={{ marginBottom: '20px' }}>
            Study Setup for {sectionName}
          </Title>
          <Select
            label="Session Length"
            value={sessionLength}
            onChange={(value) => setSessionLength(value || '10')}
            data={[
              { value: '10', label: '10 Words' },
              { value: '20', label: '20 Words' },
              { value: '50', label: '50 Words' },
              {
                value: totalWordsInSections.toString(),
                label: `All Words (${totalWordsInSections})`,
              },
            ]}
            style={{ marginBottom: '20px' }}
          />
          <Text size="sm" style={{ marginBottom: '20px' }}>
            Estimated time: {estimatedTime} minutes
          </Text>
          <Radio.Group
            name="studyMode"
            label="Study Mode"
            value={studyMode}
            onChange={(value) => setStudyMode(value as 'all' | 'difficult')}
            style={{ marginBottom: '20px' }}
          >
            <Radio value="all" label="All Words" />
            <Radio value="difficult" label="Difficult Words" />
          </Radio.Group>
          <Button onClick={handleStartStudy} fullWidth>
            Start Study Session
          </Button>
        </Paper>
      </Container>
    );
  }

  return null;
}