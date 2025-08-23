"use client";

import { useState, useEffect } from 'react';
import {
  Button,
  TextInput,
  Group,
  Box,
  Alert,
  ActionIcon,
  Stack,
  Paper,
  Text,
  Modal, Loader
} from '@mantine/core';
import { IconEdit, IconTrash, IconCheck, IconX, IconInfoCircle, IconSearch } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

interface Word {
  id: number;
  originalText: string;
  translationText: string;
  pronunciation?: string;
}

interface WordManagerProps {
  sectionId: string;
  language?: string;
  onWordsUpdated?: () => void;
  isDefault: boolean;
}

export default function WordManager({ sectionId, language, onWordsUpdated, isDefault }: WordManagerProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWord, setEditingWord] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Word>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWords();
  }, [sectionId]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sections/${sectionId}/words`);
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        setError('Failed to load words');
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setError('Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (word: Word) => {
    setEditingWord(word.id);
    setEditValues({
      originalText: word.originalText,
      translationText: word.translationText,
      pronunciation: word.pronunciation || ''
    });
  };

  const cancelEdit = () => {
    setEditingWord(null);
    setEditValues({});
  };

  const saveEdit = async (wordId: number) => {
    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editValues),
      });

      if (response.ok) {
        setWords(words.map(word =>
          word.id === wordId ? { ...word, ...editValues } : word
        ));
        setEditingWord(null);
        setEditValues({});
        setSuccess('Word updated successfully!');
        onWordsUpdated?.();
      } else {
        setError('Failed to update word');
      }
    } catch (error) {
      console.error('Error updating word:', error);
      setError('Failed to update word');
    }
  };

  const confirmDelete = (word: Word) => {
    setWordToDelete(word);
    openDeleteModal();
  };

  const deleteWord = async () => {
    if (!wordToDelete) return;

    try {
      const response = await fetch(`/api/words/${wordToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWords(words.filter(word => word.id !== wordToDelete.id));
        setSuccess('Word deleted successfully!');
        onWordsUpdated?.();
      } else {
        setError('Failed to delete word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      setError('Failed to delete word');
    } finally {
      closeDeleteModal();
      setWordToDelete(null);
    }
  };

  const filteredWords = words.filter(word =>
    word.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.translationText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (word.pronunciation && word.pronunciation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isDefault) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} style={{
        backgroundColor: 'rgba(17, 153, 142, 0.1)',
        border: '1px solid rgba(17, 153, 142, 0.2)',
        color: '#11998e'
      }}>
        Word editing is only available for custom sections. Official content cannot be modified.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box style={{ textAlign: 'center', padding: '2rem' }}>
        <Loader size="lg" />
        <Text mt="md" c="dimmed">Loading words...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Alert icon={<IconInfoCircle size={16} />} mb="md" style={{
        backgroundColor: 'rgba(17, 153, 142, 0.1)',
        border: '1px solid rgba(17, 153, 142, 0.2)',
        color: '#11998e'
      }}>
        Edit or remove words from your custom section. Changes are saved automatically.
      </Alert>

      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" mb="md" onClose={() => setSuccess(null)} withCloseButton>
          {success}
        </Alert>
      )}

      {/* Search */}
      <TextInput
        placeholder="Search words..."
        leftSection={<IconSearch size={16} />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb="md"
        style={{ maxWidth: '400px' }}
      />

      <Text size="sm" c="dimmed" mb="md">
        {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''} found
      </Text>

      <Stack gap="sm">
        {filteredWords.map((word) => (
          <Paper key={word.id} p="md" withBorder radius="md">
            {editingWord === word.id ? (
              <Stack gap="sm">
                <Group align="flex-end" wrap="nowrap">
                  <TextInput
                    label={`${language?.toUpperCase() || 'Target'} Word`}
                    value={editValues.originalText || ''}
                    onChange={(e) => setEditValues({ ...editValues, originalText: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="English Translation"
                    value={editValues.translationText || ''}
                    onChange={(e) => setEditValues({ ...editValues, translationText: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Pronunciation"
                    value={editValues.pronunciation || ''}
                    onChange={(e) => setEditValues({ ...editValues, pronunciation: e.target.value })}
                    style={{ flex: 0.8 }}
                  />
                </Group>
                <Group justify="flex-end" gap="xs">
                  <ActionIcon
                    color="gray"
                    onClick={cancelEdit}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                  <ActionIcon
                    style={{
                      background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                      color: 'white'
                    }}
                    onClick={() => saveEdit(word.id)}
                  >
                    <IconCheck size={16} />
                  </ActionIcon>
                </Group>
              </Stack>
            ) : (
              <Group justify="space-between" align="center">
                <div style={{ flex: 1 }}>
                  <Group gap="lg">
                    <div>
                      <Text fw={600} size="md">{word.originalText}</Text>
                      <Text c="dimmed" size="sm">Target language</Text>
                    </div>
                    <div>
                      <Text fw={500} size="md">{word.translationText}</Text>
                      <Text c="dimmed" size="sm">English</Text>
                    </div>
                    {word.pronunciation && (
                      <div>
                        <Text fw={400} size="md" style={{ fontStyle: 'italic' }}>
                          {word.pronunciation}
                        </Text>
                        <Text c="dimmed" size="sm">Pronunciation</Text>
                      </div>
                    )}
                  </Group>
                </div>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    onClick={() => startEdit(word)}
                    style={{ color: '#11998e' }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => confirmDelete(word)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            )}
          </Paper>
        ))}
      </Stack>

      {filteredWords.length === 0 && (
        <Paper p="xl" style={{ textAlign: 'center' }}>
          <Text size="lg" c="dimmed" mb="xs">
            {searchTerm ? 'No words found matching your search' : 'No words in this section yet'}
          </Text>
          <Text size="sm" c="dimmed">
            {searchTerm ? 'Try a different search term' : 'Use the "Add Words" tab to add vocabulary'}
          </Text>
        </Paper>
      )}

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Word" centered>
        <Stack gap="md">
          <Text>Are you sure you want to delete this word?</Text>
          {wordToDelete && (
            <Paper p="md" style={{ backgroundColor: '#fee2e2' }}>
              <Text fw={600}>{wordToDelete.originalText}</Text>
              <Text c="dimmed">{wordToDelete.translationText}</Text>
            </Paper>
          )}
          <Text size="sm" c="dimmed">This action cannot be undone.</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={deleteWord}>
              Delete Word
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}