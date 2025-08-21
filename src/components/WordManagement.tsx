"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  TextInput,
  ActionIcon,
  Modal,
  Group,
  Text,
  Alert,
  Loader,
  Pagination,
  Box
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconTrash, IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

interface Word {
  id: number;
  hebrewText: string;
  englishTranslation: string;
}

interface ApiWordResponse {
  wordId?: number;
  id?: number;
  hebrewText: string;
  correctTranslation?: string;
  englishTranslation?: string;
}

interface WordManagementProps {
  sectionId: string;
  onWordsChange?: () => void;
}

export default function WordManagement({ sectionId, onWordsChange }: WordManagementProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ hebrewText: '', englishTranslation: '' });
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const wordsPerPage = 10;

  const fetchWords = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all words for the section (we'll implement pagination on the frontend for now)
      const response = await fetch(`/api/words?sectionId=${sectionId}&length=1000&mode=all`);
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      
      const data = await response.json();
      const allWords = data.map((item: ApiWordResponse) => ({
        id: item.wordId || item.id || 0,
        hebrewText: item.hebrewText,
        englishTranslation: item.correctTranslation || item.englishTranslation || ''
      }));

      setTotalWords(allWords.length);
      
      // Implement client-side pagination
      const startIndex = (page - 1) * wordsPerPage;
      const endIndex = startIndex + wordsPerPage;
      const paginatedWords = allWords.slice(startIndex, endIndex);
      
      setWords(paginatedWords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words');
      setWords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords(currentPage);
  }, [sectionId, currentPage, fetchWords]);

  const handleEdit = (word: Word) => {
    setEditingId(word.id);
    setEditValues({
      hebrewText: word.hebrewText,
      englishTranslation: word.englishTranslation
    });
  };

  const handleSave = async () => {
    if (!editingId || !editValues.hebrewText.trim() || !editValues.englishTranslation.trim()) {
      setError('Both Hebrew text and English translation are required');
      return;
    }

    // Optimistic update - show changes immediately
    const originalWords = [...words];
    setWords(words.map(word => 
      word.id === editingId 
        ? { ...word, hebrewText: editValues.hebrewText.trim(), englishTranslation: editValues.englishTranslation.trim() }
        : word
    ));
    
    const originalEditingId = editingId;
    const originalEditValues = { ...editValues };
    
    setEditingId(null);
    setEditValues({ hebrewText: '', englishTranslation: '' });
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/words/${originalEditingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hebrewText: originalEditValues.hebrewText.trim(),
          englishTranslation: originalEditValues.englishTranslation.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update word');
      }

      // Update with server response (in case server modified the data)
      setWords(words.map(word => 
        word.id === originalEditingId 
          ? { ...word, hebrewText: result.hebrewText, englishTranslation: result.englishTranslation }
          : word
      ));

      onWordsChange?.();
    } catch (err) {
      // Revert optimistic update on error
      setWords(originalWords);
      setEditingId(originalEditingId);
      setEditValues(originalEditValues);
      setError(err instanceof Error ? err.message : 'Failed to update word');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ hebrewText: '', englishTranslation: '' });
    setError(null);
  };

  const handleDeleteClick = (word: Word) => {
    setWordToDelete(word);
    openDeleteModal();
  };

  const handleDelete = async () => {
    if (!wordToDelete) return;

    // Optimistic update - remove immediately for better UX
    const originalWords = [...words];
    const originalTotalWords = totalWords;
    
    // Update UI immediately
    setWords(words.filter(word => word.id !== wordToDelete.id));
    setTotalWords(prev => prev - 1);
    
    // If we deleted the last word on this page, go to previous page
    if (words.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
    
    closeDeleteModal();
    const deletedWord = wordToDelete;
    setWordToDelete(null);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/words/${deletedWord.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete word');
      }

      // Success - call the parent callback to update section stats
      onWordsChange?.();
    } catch (err) {
      // Revert optimistic update on error
      setWords(originalWords);
      setTotalWords(originalTotalWords);
      setError(err instanceof Error ? err.message : 'Failed to delete word');
      
      // Reopen modal to show error
      setWordToDelete(deletedWord);
      openDeleteModal();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box ta="center" py="xl">
        <Loader size="md" />
        <Text mt="md">Loading words...</Text>
      </Box>
    );
  }

  if (words.length === 0) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        No words found in this section. Add some words first to manage them.
      </Alert>
    );
  }

  const totalPages = Math.ceil(totalWords / wordsPerPage);

  return (
    <Box>
      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: 'right' }}>Hebrew</Table.Th>
            <Table.Th>English</Table.Th>
            <Table.Th w={120}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {words.map((word) => (
            <Table.Tr key={word.id}>
              <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>
                {editingId === word.id ? (
                  <TextInput
                    value={editValues.hebrewText}
                    onChange={(e) => setEditValues(prev => ({ ...prev, hebrewText: e.target.value }))}
                    style={{ textAlign: 'right', direction: 'rtl' }}
                    disabled={saving}
                  />
                ) : (
                  word.hebrewText
                )}
              </Table.Td>
              <Table.Td>
                {editingId === word.id ? (
                  <TextInput
                    value={editValues.englishTranslation}
                    onChange={(e) => setEditValues(prev => ({ ...prev, englishTranslation: e.target.value }))}
                    disabled={saving}
                  />
                ) : (
                  word.englishTranslation
                )}
              </Table.Td>
              <Table.Td>
                {editingId === word.id ? (
                  <Group gap="xs">
                    <ActionIcon
                      color="green"
                      onClick={handleSave}
                      loading={saving}
                      disabled={saving}
                    >
                      <IconCheck size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="gray"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      onClick={() => handleEdit(word)}
                      disabled={editingId !== null}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => handleDeleteClick(word)}
                      disabled={editingId !== null}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
            disabled={editingId !== null}
          />
        </Group>
      )}

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Word"
        centered
      >
        {wordToDelete && (
          <>
            <Text mb="md">
              Are you sure you want to delete this word?
            </Text>
            <Box mb="md" p="sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <Text size="sm" fw={500} style={{ textAlign: 'right', direction: 'rtl' }}>
                {wordToDelete.hebrewText}
              </Text>
              <Text size="sm" c="dimmed">
                {wordToDelete.englishTranslation}
              </Text>
            </Box>
            <Group justify="flex-end">
              <Button variant="default" onClick={closeDeleteModal} disabled={saving}>
                Cancel
              </Button>
              <Button color="red" onClick={handleDelete} loading={saving}>
                Delete
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </Box>
  );
}
