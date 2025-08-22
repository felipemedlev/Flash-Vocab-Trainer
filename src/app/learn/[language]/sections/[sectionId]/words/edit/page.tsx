"use client";

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
  Button,
  LoadingOverlay,
  Alert,
  Paper,
  Grid,
  Divider,
  Pagination,
  Affix,
  ActionIcon,
  Tooltip,
  TextInput,
  Modal,
  Badge
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconArrowLeft, 
  IconBook, 
  IconEdit, 
  IconTrash, 
  IconCheck, 
  IconX, 
  IconDeviceFloppy
} from '@tabler/icons-react';
import { getLanguageConfig, isValidLanguageCode, getLanguageFontClass } from '@/config/languages';

interface Word {
  wordId: number;
  originalText: string;
  translationText: string;
  pronunciation?: string;
  progress?: {
    isManuallyLearned: boolean;
    timesSeen: number;
    correctCount: number;
    incorrectCount: number;
    easinessFactor: number;
    interval: number;
    repetition: number;
  };
}

interface SectionInfo {
  id: number;
  name: string;
  description: string;
  totalWords: number;
  learnedWords: number;
  language: {
    code: string;
    name: string;
    nativeName: string;
    isRTL: boolean;
  };
}

interface EditingWord {
  wordId: number;
  originalText: string;
  translationText: string;
  pronunciation?: string;
  originalOriginalText: string;
  originalTranslationText: string;
  originalPronunciation?: string;
  hasChanges: boolean;
}

export default function EditWordsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const sectionId = params.sectionId as string;
  const language = params.language as string;

  const [words, setWords] = useState<Word[]>([]);
  const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [editingWords, setEditingWords] = useState<Map<number, EditingWord>>(new Map());
  const [saving, setSaving] = useState(false);
  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] = useDisclosure(false);
  const [wordToDelete, setWordToDelete] = useState<number | null>(null);
  const wordsPerPage = 50; // Smaller page size for editing

  // Validate language
  useEffect(() => {
    if (status === 'authenticated' && !isValidLanguageCode(language)) {
      setError('Invalid language code');
      setLoading(false);
    }
  }, [language, status]);

  const fetchSectionInfo = useCallback(async () => {
    if (!sectionId || !language) return;
    
    try {
      const response = await fetch(`/api/sections/${sectionId}?language=${language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch section information');
      }
      const data = await response.json();
      setSectionInfo(data);
    } catch (error) {
      console.error('Error fetching section info:', error);
      setError('Failed to load section information');
    }
  }, [sectionId, language]);

  const fetchWords = useCallback(async () => {
    if (!sectionId || !language) return;
    
    try {
      setLoading(true);
      const offset = (currentPage - 1) * wordsPerPage;
      
      const response = await fetch(`/api/words?sectionId=${sectionId}&length=${wordsPerPage}&simple=true&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      const data = await response.json();
      
      if (data.words) {
        setWords(data.words);
        setTotalWords(data.totalWords || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setWords(data);
        if (sectionInfo) {
          setTotalWords(sectionInfo.totalWords);
          setTotalPages(Math.ceil(sectionInfo.totalWords / wordsPerPage));
        }
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setError('Failed to load words');
    } finally {
      setLoading(false);
    }
  }, [sectionId, language, currentPage, wordsPerPage, sectionInfo]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSectionInfo();
    } else if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, fetchSectionInfo, router]);

  useEffect(() => {
    if (status === 'authenticated' && sectionId && language) {
      setCurrentPage(1);
    }
  }, [status, sectionId, language]);

  useEffect(() => {
    if (status === 'authenticated' && sectionId && language) {
      fetchWords();
    }
  }, [status, sectionId, language, currentPage, fetchWords]);

  const startEditing = (word: Word) => {
    const editingWord: EditingWord = {
      wordId: word.wordId,
      originalText: word.originalText,
      translationText: word.translationText,
      pronunciation: word.pronunciation,
      originalOriginalText: word.originalText,
      originalTranslationText: word.translationText,
      originalPronunciation: word.pronunciation,
      hasChanges: false
    };
    
    setEditingWords(prev => new Map(prev.set(word.wordId, editingWord)));
  };

  const updateEditingWord = (wordId: number, field: 'originalText' | 'translationText' | 'pronunciation', value: string) => {
    setEditingWords(prev => {
      const newMap = new Map(prev);
      const editingWord = newMap.get(wordId);
      if (editingWord) {
        const updatedWord = { ...editingWord, [field]: value };
        updatedWord.hasChanges = 
          updatedWord.originalText !== updatedWord.originalOriginalText || 
          updatedWord.translationText !== updatedWord.originalTranslationText ||
          updatedWord.pronunciation !== updatedWord.originalPronunciation;
        newMap.set(wordId, updatedWord);
      }
      return newMap;
    });
  };

  const cancelEditing = (wordId: number) => {
    setEditingWords(prev => {
      const newMap = new Map(prev);
      newMap.delete(wordId);
      return newMap;
    });
  };

  const saveWord = async (wordId: number) => {
    const editingWord = editingWords.get(wordId);
    if (!editingWord || !editingWord.hasChanges) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: editingWord.originalText.trim(),
          translationText: editingWord.translationText.trim(),
          pronunciation: editingWord.pronunciation?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update word');
      }

      // Update the words list
      setWords(prev => prev.map(word => 
        word.wordId === wordId 
          ? { ...word, originalText: editingWord.originalText, translationText: editingWord.translationText, pronunciation: editingWord.pronunciation }
          : word
      ));

      // Remove from editing
      cancelEditing(wordId);

      notifications.show({
        title: 'Success',
        message: 'Word updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Error saving word:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update word',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteWord = async (wordId: number) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete word');
      }

      // Remove from words list
      setWords(prev => prev.filter(word => word.wordId !== wordId));
      
      // Remove from editing if it was being edited
      cancelEditing(wordId);

      // Update total count
      setTotalWords(prev => prev - 1);

      notifications.show({
        title: 'Success',
        message: 'Word deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Error deleting word:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete word',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setSaving(false);
      closeConfirmModal();
      setWordToDelete(null);
    }
  };

  const handleDeleteClick = (wordId: number) => {
    setWordToDelete(wordId);
    openConfirmModal();
  };

  const saveAllChanges = async () => {
    const changedWords = Array.from(editingWords.values()).filter(word => word.hasChanges);
    if (changedWords.length === 0) return;

    try {
      setSaving(true);
      const updatePromises = changedWords.map(word => 
        fetch(`/api/words/${word.wordId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalText: word.originalText.trim(),
            translationText: word.translationText.trim(),
            pronunciation: word.pronunciation?.trim() || undefined,
          }),
        })
      );

      const responses = await Promise.all(updatePromises);
      const failedUpdates = responses.filter(response => !response.ok);

      if (failedUpdates.length > 0) {
        throw new Error(`Failed to update ${failedUpdates.length} words`);
      }

      // Update the words list
      setWords(prev => prev.map(word => {
        const editingWord = editingWords.get(word.wordId);
        if (editingWord && editingWord.hasChanges) {
          return { ...word, originalText: editingWord.originalText, translationText: editingWord.translationText, pronunciation: editingWord.pronunciation };
        }
        return word;
      }));

      // Clear all editing states
      setEditingWords(new Map());

      notifications.show({
        title: 'Success',
        message: `Successfully updated ${changedWords.length} words`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Error saving words:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save some changes',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = Array.from(editingWords.values()).some(word => word.hasChanges);

  if (status === 'loading') {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="Error" mb="md">
          {error}
        </Alert>
        <Button 
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const languageConfig = getLanguageConfig(language);
  const fontClass = getLanguageFontClass(language);

  return (
    <>
      <Container size="lg" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="md" mb="xs">
                <Button 
                  variant="subtle" 
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.push(`/learn/${language}/sections/${sectionId}/words`)}
                >
                  Back to Words
                </Button>
                {sectionInfo && (
                  <Badge color="blue" variant="light">
                    {languageConfig?.name}
                  </Badge>
                )}
              </Group>
              <Title order={1} mb="xs">
                ✏️ Edit Words - {sectionInfo?.name || 'Section'}
              </Title>
              {sectionInfo?.description && (
                <Text c="dimmed" size="lg">
                  {sectionInfo.description}
                </Text>
              )}
            </div>
          </Group>

          {/* Stats */}
          {sectionInfo && (
            <Paper p="md" withBorder>
              <Group justify="space-around">
                <div style={{ textAlign: 'center' }}>
                  <Text size="xl" fw={700} c="blue">
                    {sectionInfo.totalWords}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Total Words
                  </Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text size="xl" fw={700} c="green">
                    {sectionInfo.learnedWords}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Learned
                  </Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text size="xl" fw={700} c="orange">
                    {sectionInfo.totalWords - sectionInfo.learnedWords}
                  </Text>
                  <Text size="sm" c="dimmed">
                    To Learn
                  </Text>
                </div>
              </Group>
            </Paper>
          )}

          {/* Controls */}
          <Group justify="space-between">
            <div>
              <Text size="lg" fw={600}>
                Edit Words ({totalWords > 0 ? totalWords : words.length})
              </Text>
              {totalPages > 1 && (
                <Text size="sm" c="dimmed">
                  Page {currentPage} of {totalPages}
                </Text>
              )}
            </div>
            {hasUnsavedChanges && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={saveAllChanges}
                loading={saving}
                color="green"
              >
                Save All Changes
              </Button>
            )}
          </Group>

          <Divider />

          {/* Words Grid */}
          <LoadingOverlay visible={loading} />
          <Grid gutter="md">
            {words.map((word, index) => {
              const editingWord = editingWords.get(word.wordId);
              const isEditing = !!editingWord;
              
              return (
                <Grid.Col key={word.wordId} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card 
                    shadow="sm" 
                    padding="lg" 
                    radius="md" 
                    withBorder
                    style={{
                      height: '100%',
                      background: editingWord?.hasChanges 
                        ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.05), rgba(255, 193, 7, 0.1))'
                        : word.progress?.isManuallyLearned 
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1))'
                        : 'white'
                    }}
                  >
                    <Stack gap="xs">
                      {/* Original Text */}
                      <div>
                        {isEditing ? (
                          <TextInput
                            value={editingWord.originalText}
                            onChange={(e) => updateEditingWord(word.wordId, 'originalText', e.target.value)}
                            placeholder="Original text"
                            style={{ textAlign: 'center' }}
                            className={fontClass}
                            size="md"
                            fw={700}
                          />
                        ) : (
                          <Text 
                            size="lg" 
                            fw={700} 
                            ta="center" 
                            className={fontClass}
                            style={{ direction: languageConfig?.isRTL ? 'rtl' : 'ltr' }}
                          >
                            {word.originalText}
                          </Text>
                        )}
                      </div>

                      {/* Translation */}
                      <div>
                        {isEditing ? (
                          <TextInput
                            value={editingWord.translationText}
                            onChange={(e) => updateEditingWord(word.wordId, 'translationText', e.target.value)}
                            placeholder="English translation"
                            style={{ textAlign: 'center' }}
                            size="md"
                          />
                        ) : (
                          <Text size="md" c="dimmed" ta="center">
                            {word.translationText}
                          </Text>
                        )}
                      </div>

                      {/* Pronunciation */}
                      <div>
                        {isEditing ? (
                          <TextInput
                            value={editingWord.pronunciation || ''}
                            onChange={(e) => updateEditingWord(word.wordId, 'pronunciation', e.target.value)}
                            placeholder="Pronunciation (optional)"
                            style={{ textAlign: 'center' }}
                            size="sm"
                          />
                        ) : (
                          word.pronunciation && (
                            <Text size="sm" c="dimmed" ta="center" fs="italic">
                              [{word.pronunciation}]
                            </Text>
                          )
                        )}
                      </div>

                      {/* Action Buttons */}
                      <Group justify="center" gap="xs" mt="sm">
                        {isEditing ? (
                          <>
                            <Button
                              size="xs"
                              color="green"
                              leftSection={<IconCheck size={12} />}
                              onClick={() => saveWord(word.wordId)}
                              disabled={!editingWord.hasChanges}
                              loading={saving}
                            >
                              Save
                            </Button>
                            <Button
                              size="xs"
                              variant="light"
                              color="gray"
                              leftSection={<IconX size={12} />}
                              onClick={() => cancelEditing(word.wordId)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="xs"
                              variant="light"
                              leftSection={<IconEdit size={12} />}
                              onClick={() => startEditing(word)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="xs"
                              variant="light"
                              color="red"
                              leftSection={<IconTrash size={12} />}
                              onClick={() => handleDeleteClick(word.wordId)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </Group>

                      {/* Word Number */}
                      <Text size="xs" c="dimmed" ta="center">
                        Word #{((currentPage - 1) * wordsPerPage) + index + 1}
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                size="lg"
                radius="md"
                withEdges
              />
            </Group>
          )}

          {/* Empty State */}
          {!loading && words.length === 0 && (
            <Paper p="xl" ta="center">
              <IconBook size={48} style={{ margin: '0 auto 1rem' }} />
              <Title order={3} mb="md">
                No words found
              </Title>
              <Text c="dimmed" mb="lg">
                This section doesn't have any words yet.
              </Text>
              <Button 
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </Paper>
          )}
        </Stack>
      </Container>

      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <Affix position={{ bottom: 20, right: 20 }}>
          <Tooltip
            label="Save All Changes"
            position="left"
            withArrow
          >
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="green"
              onClick={saveAllChanges}
              loading={saving}
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
            >
              <IconDeviceFloppy size={24} />
            </ActionIcon>
          </Tooltip>
        </Affix>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        opened={confirmModalOpened}
        onClose={closeConfirmModal}
        title="Confirm Deletion"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this word? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={closeConfirmModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={() => wordToDelete && deleteWord(wordToDelete)}
              loading={saving}
            >
              Delete Word
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}