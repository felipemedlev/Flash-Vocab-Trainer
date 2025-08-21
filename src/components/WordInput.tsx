"use client";

import { useState } from 'react';
import { 
  Button, 
  TextInput, 
  Group, 
  Box, 
  Text, 
  Alert,
  ActionIcon,
  Stack,
  Paper
} from '@mantine/core';
import { IconPlus, IconTrash, IconInfoCircle } from '@tabler/icons-react';

interface WordRow {
  id: string;
  hebrewText: string;
  englishTranslation: string;
}

interface WordInputProps {
  sectionId: string;
  onWordsSaved?: () => void;
}

export default function WordInput({ sectionId, onWordsSaved }: WordInputProps) {
  const [wordRows, setWordRows] = useState<WordRow[]>([
    { id: `row-${Date.now()}`, hebrewText: '', englishTranslation: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addNewRow = () => {
    const newRow: WordRow = {
      id: `row-${Date.now()}`,
      hebrewText: '',
      englishTranslation: ''
    };
    setWordRows([...wordRows, newRow]);
  };

  const removeRow = (id: string) => {
    if (wordRows.length > 1) {
      setWordRows(wordRows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: 'hebrewText' | 'englishTranslation', value: string) => {
    setWordRows(wordRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, rowId: string, field: 'hebrewText' | 'englishTranslation') => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    
    // Check if it's multi-line paste (from Excel)
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 1) {
      // Multi-line paste - treat as Excel data
      const currentRowIndex = wordRows.findIndex(row => row.id === rowId);
      if (currentRowIndex === -1) return;
      
      const newRows = [...wordRows];
      
      lines.forEach((line, index) => {
        const cells = line.split('\t');
        const targetIndex = currentRowIndex + index;
        
        if (targetIndex < newRows.length) {
          if (field === 'hebrewText' && cells[0]) {
            newRows[targetIndex].hebrewText = cells[0].trim();
          }
          if (cells[1] && field === 'hebrewText') {
            newRows[targetIndex].englishTranslation = cells[1].trim();
          } else if (field === 'englishTranslation' && cells[0]) {
            newRows[targetIndex].englishTranslation = cells[0].trim();
          }
        } else {
          // Add new rows if needed
          const newRow: WordRow = {
            id: `row-${Date.now()}-${index}`,
            hebrewText: field === 'hebrewText' && cells[0] ? cells[0].trim() : '',
            englishTranslation: cells[1] ? cells[1].trim() : (field === 'englishTranslation' && cells[0] ? cells[0].trim() : '')
          };
          newRows.push(newRow);
        }
      });
      
      setWordRows(newRows);
    } else {
      // Single line paste
      updateRow(rowId, field, pastedText.trim());
    }
  };

  const saveWords = async () => {
    const validWords = wordRows.filter(row => 
      row.hebrewText.trim() !== '' && row.englishTranslation.trim() !== ''
    );
    
    if (validWords.length === 0) {
      setError('Please add at least one word with both Hebrew and English text.');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: parseInt(sectionId),
          words: validWords.map(row => ({
            hebrewText: row.hebrewText.trim(),
            englishTranslation: row.englishTranslation.trim()
          }))
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const successMessage = `Successfully added ${result.addedCount} words!${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates were skipped)` : ''}`;
        setSuccess(successMessage);
        
        // Clear the form
        setWordRows([{ id: `row-${Date.now()}`, hebrewText: '', englishTranslation: '' }]);
        onWordsSaved?.();
      } else {
        setError(result.message || 'Failed to save words');
      }
    } catch (err) {
      setError('Failed to save words. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setWordRows([{ id: `row-${Date.now()}`, hebrewText: '', englishTranslation: '' }]);
    setError(null);
    setSuccess(null);
  };

  return (
    <Box>
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mb="md">
        Add new words to this section. You can type directly or paste from Excel (Ctrl+V).
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

      <Stack gap="sm">
        {wordRows.map((row, index) => (
          <Paper key={row.id} p="sm" withBorder>
            <Group align="flex-end" wrap="nowrap">
              <TextInput
                label={index === 0 ? "Hebrew" : undefined}
                placeholder="Enter Hebrew text..."
                value={row.hebrewText}
                onChange={(e) => updateRow(row.id, 'hebrewText', e.target.value)}
                onPaste={(e) => handlePaste(e, row.id, 'hebrewText')}
                style={{ textAlign: 'right', direction: 'rtl', flex: 1 }}
                disabled={saving}
              />
              <TextInput
                label={index === 0 ? "English" : undefined}
                placeholder="Enter English translation..."
                value={row.englishTranslation}
                onChange={(e) => updateRow(row.id, 'englishTranslation', e.target.value)}
                onPaste={(e) => handlePaste(e, row.id, 'englishTranslation')}
                style={{ flex: 1 }}
                disabled={saving}
              />
              {wordRows.length > 1 && (
                <ActionIcon
                  color="red"
                  onClick={() => removeRow(row.id)}
                  disabled={saving}
                  style={{ marginBottom: index === 0 ? 0 : 8 }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          </Paper>
        ))}
      </Stack>
      
      <Group justify="space-between" mt="md">
        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          onClick={addNewRow}
          disabled={saving}
        >
          Add Row
        </Button>
        
        <Group>
          <Button
            variant="default"
            onClick={clearForm}
            disabled={saving}
          >
            Clear
          </Button>
          <Button
            onClick={saveWords}
            loading={saving}
          >
            Save Words
          </Button>
        </Group>
      </Group>
    </Box>
  );
}
