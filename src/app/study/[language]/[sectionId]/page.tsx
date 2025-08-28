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
import { IconPlayerPlay, IconInfoCircle, IconArrowLeft } from '@tabler/icons-react';
import StudySessionSetup from '@/components/StudySessionSetup';
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
    <Container size="lg" py="sm">
      {/* Header with Back Button */}
      <Group justify="space-between" mb="md">
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
          size="lg"
          style={isCompleted ? {
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white'
          } : {
            background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.05))',
            color: '#11998e',
            border: '1px solid rgba(17, 153, 142, 0.3)'
          }}
        >
          {isCompleted ? '✅ Completed' : `${wordsLeft} words left`}
        </Badge>
      </Group>

      {/* Section Info Card */}
      <Paper
        withBorder
        p="md"
        radius="lg"
        mb="md"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.05), rgba(56, 239, 125, 0.02))',
          border: '1px solid rgba(17, 153, 142, 0.15)',
          boxShadow: '0 4px 16px rgba(17, 153, 142, 0.08)'
        }}
      >
        <Group justify="space-between" align="start" mb="md">
          <div style={{ flex: 1 }}>
            <Group gap="sm" mb="xs">
              <Title order={2} style={{ color: '#1f2937' }}>
                {section.name}
              </Title>
              <Text size="2rem">📚</Text>
            </Group>
            <Text c="dimmed" size="md" mb="sm">
              {section.description || `Master essential ${languageConfig.name} vocabulary`}
            </Text>
            <Group gap="sm">
              {section.isDefault && (
                <Badge variant="light" style={{
                  backgroundColor: 'rgba(17, 153, 142, 0.1)',
                  color: '#11998e',
                  border: '1px solid rgba(17, 153, 142, 0.2)'
                }}>
                  ⭐ Official Content
                </Badge>
              )}
              {isCompleted && (
                <Badge style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white'
                }}>
                  🎉 Section Complete!
                </Badge>
              )}
              {!isCompleted && progressPercentage > 0 && (
                <Badge variant="light" style={{
                  backgroundColor: 'rgba(17, 153, 142, 0.1)',
                  color: '#11998e',
                  border: '1px solid rgba(17, 153, 142, 0.2)'
                }}>
                  🚀 {Math.round(progressPercentage)}% Complete
                </Badge>
              )}
            </Group>
          </div>
          {!isCompleted && (
            <div style={{ textAlign: 'center' }}>
              <Text size="1.5rem" mb="xs">💪</Text>
              <Text size="sm" fw={600} style={{ color: '#11998e' }}>
                Keep Going!
              </Text>
              <Text size="xs" c="dimmed">
                {wordsLeft} words left
              </Text>
            </div>
          )}
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
            mb="md"
            style={{
              backgroundColor: 'rgba(17, 153, 142, 0.1)'
            }}
            styles={{
              section: {
                background: isCompleted
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : 'linear-gradient(135deg, #11998e, #38ef7d)'
              }
            }}
          />
          <Group justify="space-between" mb="md">
            <Text size="sm" c="dimmed">
              {section.learnedWords} words learned
            </Text>
            <Text size="sm" c="dimmed">
              {section.totalWords} total words
            </Text>
          </Group>

          {/* Motivational Message with Study Options */}
          <Paper p="lg" radius="lg" style={{
            background: progressPercentage > 0 
              ? (isCompleted
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))'
                  : 'linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.05))')
              : 'linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.05))',
            border: progressPercentage > 0
              ? `1px solid ${isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(17, 153, 142, 0.2)'}`
              : '1px solid rgba(17, 153, 142, 0.2)',
            textAlign: 'center'
          }}>
            {progressPercentage > 0 && (
              <>
                {isCompleted ? (
                  <>
                    <Text size="1.5rem" mb="xs">🎉</Text>
                    <Text fw={600} style={{ color: '#22c55e' }} mb="sm">
                      Congratulations! Section Complete!
                    </Text>
                    <Text size="sm" c="dimmed" mb="lg">
                      You've mastered all {section.totalWords} words in this section
                    </Text>
                  </>
                ) : progressPercentage >= 75 ? (
                  <>
                    <Text size="1.2rem" mb="xs">🔥</Text>
                    <Text fw={600} style={{ color: '#11998e' }} mb="sm">
                      Almost there! You're doing great!
                    </Text>
                    <Text size="sm" c="dimmed" mb="lg">
                      Just {wordsLeft} more words to complete this section
                    </Text>
                  </>
                ) : progressPercentage >= 50 ? (
                  <>
                    <Text size="1.2rem" mb="xs">💪</Text>
                    <Text fw={600} style={{ color: '#11998e' }} mb="sm">
                      Great progress! Keep it up!
                    </Text>
                    <Text size="sm" c="dimmed" mb="lg">
                      You're halfway through this section
                    </Text>
                  </>
                ) : progressPercentage >= 25 ? (
                  <>
                    <Text size="1.2rem" mb="xs">🚀</Text>
                    <Text fw={600} style={{ color: '#11998e' }} mb="sm">
                      You're building momentum!
                    </Text>
                    <Text size="sm" c="dimmed" mb="lg">
                      Every word learned is progress made
                    </Text>
                  </>
                ) : (
                  <>
                    <Text size="1.2rem" mb="xs">🌟</Text>
                    <Text fw={600} style={{ color: '#11998e' }} mb="sm">
                      Ready to start your journey?
                    </Text>
                    <Text size="sm" c="dimmed" mb="lg">
                      Begin learning and watch your progress grow
                    </Text>
                  </>
                )}
              </>
            )}
            
            {/* Study Options integrated into motivational container */}
            <StudySessionSetup
              sectionId={sectionId as string}
              language={language}
            />
          </Paper>
        </div>
      </Paper>

    </Container>
  );
}