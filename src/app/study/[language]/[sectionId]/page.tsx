"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Container,
  Title,
  Text,
  Paper,
  Loader,
  Center,
  Alert,
  Group,
  Badge,
  Progress,
  ActionIcon
} from '@mantine/core';
import { IconPlayerPlay, IconPlus, IconInfoCircle, IconArrowLeft, IconEdit } from '@tabler/icons-react';
import StudySessionSetup from '@/components/StudySessionSetup';
import WordInput from '@/components/WordInput';
import { getLanguageConfig, isValidLanguageCode } from '@/config/languages';
import { LanguageDisplay } from '@/components/LanguageText';

interface Section {
  id: number;
  name: string;
  description: string | null;
  totalWords: number;
  learnedWords: number;
  isDefault: boolean;
  languageId: number;
}

export default function LanguageStudyPage() {
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('study');
  const params = useParams();
  const router = useRouter();
  const sectionId = params.sectionId as string;
  const language = params.language as string;
  const { status } = useSession();
  const isLoadingRef = useRef(false);

  const languageConfig = getLanguageConfig(language);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (!isValidLanguageCode(language)) {
      router.push('/');
      return;
    }
  }, [status, language, router]);

  const fetchSection = useCallback(async () => {
    if (!sectionId || !language) {
      router.replace(`/learn/${language}/sections`);
      return;
    }
    
    if (status === 'authenticated' && !isLoadingRef.current && isValidLanguageCode(language)) {
      try {
        isLoadingRef.current = true;
        setLoading(true);
        const response = await fetch(`/api/sections/${sectionId}?language=${language}`);
        if (response.ok) {
          const data = await response.json();
          setSection(data);
        }
      } catch (error) {
        console.error("Failed to fetch section:", error);
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    }
  }, [sectionId, language, status, router]);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  if (status === 'loading' || loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  if (!languageConfig) {
    return (
      <Center h="100vh">
        <Alert icon={<IconInfoCircle size={16} />} color="red">
          Language not supported.
        </Alert>
      </Center>
    );
  }

  if (!section) {
    return (
      <Center h="100vh">
        <Alert icon={<IconInfoCircle size={16} />} color="red">
          Section not found.
        </Alert>
      </Center>
    );
  }

  const progressPercentage = section.totalWords > 0 ? (section.learnedWords / section.totalWords) * 100 : 0;
  const wordsLeft = section.totalWords - section.learnedWords;
  const isCompleted = wordsLeft === 0;

  return (
    <Container size="lg" py="xl">
      {/* Header with Back Button */}
      <Group justify="space-between" mb="xl">
        <Group gap="md">
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => router.push(`/learn/${language}/sections`)}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <LanguageDisplay language={language} showFlag={true} />
        </Group>
        <Badge 
          color={isCompleted ? 'green' : 'blue'} 
          size="lg"
        >
          {isCompleted ? '✅ Completed' : `${wordsLeft} words left`}
        </Badge>
      </Group>

      {/* Section Info Card */}
      <Paper 
        withBorder 
        p="xl" 
        radius="lg" 
        mb="xl" 
        style={{ 
          background: 'linear-gradient(135deg, #667eea10, #764ba210)',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}
      >
        <Group justify="space-between" align="start" mb="lg">
          <div>
            <Title order={2} mb="xs" style={{ color: '#1f2937' }}>
              {section.name} 📚
            </Title>
            <Text c="dimmed" size="md">
              {section.description || `Master essential ${languageConfig.name} vocabulary`}
            </Text>
            {section.isDefault && (
              <Badge color="blue" variant="light" mt="xs">
                Official Content
              </Badge>
            )}
          </div>
        </Group>

        {/* Progress Section */}
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500} style={{ color: '#374151' }}>
              Your Progress
            </Text>
            <Text size="sm" c="dimmed">
              {Math.round(progressPercentage)}%
            </Text>
          </Group>
          <Progress 
            value={progressPercentage} 
            size="xl" 
            radius="md" 
            color={isCompleted ? 'green' : 'blue'}
            mb="md"
          />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {section.learnedWords} words learned
            </Text>
            <Text size="sm" c="dimmed">
              {section.totalWords} total words
            </Text>
          </Group>
        </div>
      </Paper>

      {/* Main Content */}
      <Paper shadow="md" p="xl" radius="md">
        {activeTab === 'study' ? (
          <StudySessionSetup 
            sectionId={sectionId as string} 
            language={language}
          />
        ) : (
          <WordInput 
            sectionId={sectionId as string} 
            language={language}
            onWordsSaved={() => {
              // Refresh section data after adding words
              window.location.reload();
            }} 
          />
        )}

        {/* Tab Navigation */}
        <Group justify="center" mt="xl">
          <Badge
            variant={activeTab === 'study' ? 'filled' : 'outline'}
            size="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('study')}
            leftSection={<IconPlayerPlay size={16} />}
          >
            Study Session
          </Badge>
          <Badge
            variant={activeTab === 'add' ? 'filled' : 'outline'}
            size="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('add')}
            leftSection={<IconPlus size={16} />}
          >
            Add Words
          </Badge>
          {!section.isDefault && (
            <Badge
              variant="outline"
              size="lg"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/learn/${language}/sections/${sectionId}/words/edit`)}
              leftSection={<IconEdit size={16} />}
              color="orange"
            >
              Edit Words
            </Badge>
          )}
        </Group>
      </Paper>
    </Container>
  );
}