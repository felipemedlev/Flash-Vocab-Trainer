'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Badge,
  Button,
  LoadingOverlay,
  Alert,
  Paper,
  SimpleGrid,
  Progress,
  Divider,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlus,
  IconInfoCircle,
  IconArrowLeft,
  IconEye,
  IconEdit,
  IconUpload,
  IconStar
} from '@tabler/icons-react';
import Link from 'next/link';
import { getLanguageConfig, isValidLanguageCode } from '@/config/languages';
import { LanguageDisplay, LanguageText } from '@/components/LanguageText';

interface Section {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  totalWords: number;
  learnedWords: number;
  languageId: number;
}

export default function LanguageSectionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const language = params.language as string;

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchSections = useCallback(async () => {
    if (status === 'authenticated' && isValidLanguageCode(language)) {
      try {
        setLoading(true);
        const response = await fetch(`/api/sections?language=${language}`);
        if (response.ok) {
          const data = await response.json();
          setSections(data);
        } else {
          setError('Failed to load sections');
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        setError('Failed to load sections');
      } finally {
        setLoading(false);
      }
    }
  }, [status, language]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  if (status === 'loading' || loading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (!languageConfig) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconInfoCircle size={16} />} color="red">
          Language not supported or invalid.
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconInfoCircle size={16} />} color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  const defaultSections = sections.filter(section => section.isDefault);
  const customSections = sections.filter(section => !section.isDefault);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => router.push('/')}
              style={{ cursor: 'pointer' }}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <LanguageDisplay
                language={language}
                showFlag={true}
                showNativeName={true}
                size="xl"
              />
              <Text c="dimmed" size="md">
                Choose a section to start learning
              </Text>
            </div>
          </Group>

          <Group gap="sm">
            <Button
              component={Link}
              href={`/learn/${language}/upload`}
              leftSection={<IconUpload size={16} />}
              variant="light"
            >
              Upload Content
            </Button>
          </Group>
        </Group>

        {/* Stats */}
        <Paper withBorder p="md" radius="md">
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <Text size="xl" fw={700} c="blue">
                {sections.length}
              </Text>
              <Text size="sm" c="dimmed">Sections Available</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xl" fw={700} c="green">
                {sections.reduce((sum, section) => sum + section.totalWords, 0)}
              </Text>
              <Text size="sm" c="dimmed">Total Words</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xl" fw={700} c="orange">
                {sections.reduce((sum, section) => sum + section.learnedWords, 0)}
              </Text>
              <Text size="sm" c="dimmed">Words Learned</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xl" fw={700} c="grape">
                {sections.length > 0
                  ? Math.round((sections.reduce((sum, section) => sum + section.learnedWords, 0) /
                     sections.reduce((sum, section) => sum + section.totalWords, 0)) * 100) || 0
                  : 0}%
              </Text>
              <Text size="sm" c="dimmed">Progress</Text>
            </div>
          </SimpleGrid>
        </Paper>

        {/* Default Sections */}
        {defaultSections.length > 0 && (
          <Stack gap="md">
            <Group gap="sm">
              <IconStar size={20} color="var(--mantine-color-blue-6)" />
              <Title order={2}>Official Content</Title>
              <Badge color="blue" variant="light">Curated</Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {defaultSections.map((section) => {
                const progressPercentage = section.totalWords > 0
                  ? (section.learnedWords / section.totalWords) * 100
                  : 0;
                const isCompleted = progressPercentage === 100;

                return (
                  <Card
                    key={section.id}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                      background: isCompleted
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1))'
                        : 'white',
                      borderColor: isCompleted ? 'var(--mantine-color-green-3)' : undefined
                    }}
                  >
                    <Stack gap="sm">
                      <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1 }}>
                          <LanguageText
                            text={section.name}
                            language={language}
                            size="lg"
                            fw={600}
                          />
                          {section.description && (
                            <Text size="sm" c="dimmed" mt="xs">
                              {section.description}
                            </Text>
                          )}
                        </div>
                        {isCompleted && (
                          <Badge color="green" variant="light" size="sm">
                            ✅ Complete
                          </Badge>
                        )}
                      </Group>

                      <Progress
                        value={progressPercentage}
                        color={isCompleted ? 'green' : 'blue'}
                        size="sm"
                        radius="md"
                      />

                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          {section.learnedWords} / {section.totalWords} words
                        </Text>
                        <Text size="xs" c="dimmed">
                          {Math.round(progressPercentage)}%
                        </Text>
                      </Group>

                      <Group gap="xs" mt="sm">
                        <Button
                          component={Link}
                          href={`/study/${language}/${section.id}`}
                          leftSection={<IconPlayerPlay size={16} />}
                          flex={1}
                          color={isCompleted ? 'green' : 'blue'}
                        >
                          {isCompleted ? 'Review' : 'Study'}
                        </Button>

                        <Tooltip label="View Words">
                          <ActionIcon
                            component={Link}
                            href={`/learn/${language}/sections/${section.id}/words`}
                            variant="light"
                            size="lg"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
        )}

        {/* Custom Sections */}
        <>
          <Divider />
          <Stack gap="md">
            <Group gap="sm">
              <IconPlus size={20} style={{ color: '#11998e' }} />
              <Title order={2}>Your Custom Content</Title>
              <Badge variant="light" style={{
                backgroundColor: 'rgba(17, 153, 142, 0.1)',
                color: '#11998e',
                border: '1px solid rgba(17, 153, 142, 0.2)'
              }}>Personal</Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {/* Add New Section Card */}
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  component={Link}
                  href={`/learn/${language}/create-section`}
                  style={{
                    border: '2px dashed rgba(17, 153, 142, 0.4)',
                    backgroundColor: 'rgba(17, 153, 142, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(17, 153, 142, 0.6)';
                    e.currentTarget.style.backgroundColor = 'rgba(17, 153, 142, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.borderColor = 'rgba(17, 153, 142, 0.4)';
                    e.currentTarget.style.backgroundColor = 'rgba(17, 153, 142, 0.02)';
                  }}
                >
                  <Stack align="center" gap="md">
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.05))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(17, 153, 142, 0.4)'
                      }}
                    >
                      <IconPlus size={24} style={{ color: '#11998e' }} />
                    </div>
                    <Stack align="center" gap={4}>
                      <Text size="lg" fw={600} style={{ color: '#11998e' }}>
                        Create New Section
                      </Text>
                      <Text size="sm" c="dimmed" ta="center">
                        Add your own vocabulary manually
                      </Text>
                    </Stack>
                  </Stack>
                </Card>

                {customSections.map((section) => {
                  const progressPercentage = section.totalWords > 0
                    ? (section.learnedWords / section.totalWords) * 100
                    : 0;
                  const isCompleted = progressPercentage === 100;

                  return (
                    <Card
                      key={section.id}
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{
                        background: isCompleted
                          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1))'
                          : 'linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(255, 152, 0, 0.1))',
                        borderColor: isCompleted ? 'var(--mantine-color-green-3)' : 'var(--mantine-color-orange-3)'
                      }}
                    >
                      <Stack gap="sm">
                        <Group justify="space-between" align="flex-start">
                          <div style={{ flex: 1 }}>
                            <LanguageText
                              text={section.name}
                              language={language}
                              size="lg"
                              fw={600}
                            />
                            {section.description && (
                              <Text size="sm" c="dimmed" mt="xs">
                                {section.description}
                              </Text>
                            )}
                          </div>
                          {isCompleted && (
                            <Badge color="green" variant="light" size="sm">
                              ✅ Complete
                            </Badge>
                          )}
                        </Group>

                        <Progress
                          value={progressPercentage}
                          color={isCompleted ? 'green' : 'orange'}
                          size="sm"
                          radius="md"
                        />

                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            {section.learnedWords} / {section.totalWords} words
                          </Text>
                          <Text size="xs" c="dimmed">
                            {Math.round(progressPercentage)}%
                          </Text>
                        </Group>

                        <Group gap="xs" mt="sm">
                          <Button
                            component={Link}
                            href={`/study/${language}/${section.id}`}
                            leftSection={<IconPlayerPlay size={16} />}
                            flex={1}
                            color={isCompleted ? 'green' : 'orange'}
                          >
                            {isCompleted ? 'Review' : 'Study'}
                          </Button>

                          <Tooltip label="View Words">
                            <ActionIcon
                              component={Link}
                              href={`/learn/${language}/sections/${section.id}/words`}
                              variant="light"
                              size="lg"
                              color="orange"
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Edit Words">
                            <ActionIcon
                              component={Link}
                              href={`/learn/${language}/sections/${section.id}/words/edit`}
                              variant="light"
                              size="lg"
                              color="orange"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Stack>
                    </Card>
                  );
                })}
            </SimpleGrid>
          </Stack>
        </>

        {/* Empty State */}
        {sections.length === 0 && !loading && (
          <Paper p="xl" ta="center" withBorder>
            <Stack gap="md" align="center">
              <Text size="3rem">📚</Text>
              <Title order={3}>No sections available yet</Title>
              <Text c="dimmed" mb="lg">
                Get started by uploading your own content or wait for official sections to be added.
              </Text>
              <Button
                component={Link}
                href={`/learn/${language}/upload`}
                leftSection={<IconUpload size={16} />}
                size="lg"
              >
                Upload Your First Section
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}