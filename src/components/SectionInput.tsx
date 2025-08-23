"use client";

import { useState } from 'react';
import { 
  Button, 
  TextInput, 
  Group, 
  Box, 
  Alert,
  ActionIcon,
  Stack,
  Paper,
  Textarea
} from '@mantine/core';
import { IconPlus, IconTrash, IconInfoCircle } from '@tabler/icons-react';

interface WordRow {
  id: string;
  originalText: string;
  translationText: string;
  pronunciation?: string;
}

interface SectionInputProps {
  language: string;
  onSectionSaved?: (sectionId: number) => void;
}

export default function SectionInput({ language, onSectionSaved }: SectionInputProps) {
  const [sectionName, setSectionName] = useState('');
  const [description, setDescription] = useState('');
  const [wordRows, setWordRows] = useState<WordRow[]>([
    { id: `row-${Date.now()}`, originalText: '', translationText: '', pronunciation: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addNewRow = () => {
    const newRow: WordRow = {
      id: `row-${Date.now()}`,
      originalText: '',
      translationText: '',
      pronunciation: ''
    };
    setWordRows([...wordRows, newRow]);
  };

  const removeRow = (id: string) => {
    if (wordRows.length > 1) {
      setWordRows(wordRows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: 'originalText' | 'translationText' | 'pronunciation', value: string) => {
    setWordRows(wordRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, rowId: string, field: 'originalText' | 'translationText') => {
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
          if (field === 'originalText' && cells[0]) {
            newRows[targetIndex].originalText = cells[0].trim();
          }
          if (cells[1] && field === 'originalText') {
            newRows[targetIndex].translationText = cells[1].trim();
          } else if (field === 'translationText' && cells[0]) {
            newRows[targetIndex].translationText = cells[0].trim();
          }
          if (cells[2]) {
            newRows[targetIndex].pronunciation = cells[2].trim();
          }
        } else {
          // Add new rows if needed
          const newRow: WordRow = {
            id: `row-${Date.now()}-${index}`,
            originalText: field === 'originalText' && cells[0] ? cells[0].trim() : '',
            translationText: cells[1] ? cells[1].trim() : (field === 'translationText' && cells[0] ? cells[0].trim() : ''),
            pronunciation: cells[2] ? cells[2].trim() : ''
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

  const createSection = async () => {
    const validWords = wordRows.filter(row => 
      row.originalText.trim() !== '' && row.translationText.trim() !== ''
    );
    
    if (!sectionName.trim()) {
      setError('Please provide a section name.');
      return;
    }
    
    if (validWords.length === 0) {
      setError('Please add at least one word with both original and translation text.');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sectionName.trim(),
          description: description.trim() || null,
          language: language,
          words: validWords.map(row => ({
            originalText: row.originalText.trim(),
            translationText: row.translationText.trim(),
            pronunciation: row.pronunciation?.trim() || undefined
          }))
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const successMessage = `Section "${sectionName}" created successfully with ${validWords.length} words!`;
        setSuccess(successMessage);
        
        // Clear the form
        setSectionName('');
        setDescription('');
        setWordRows([{ id: `row-${Date.now()}`, originalText: '', translationText: '', pronunciation: '' }]);
        
        // Call callback with the new section ID
        if (result.sectionId) {
          setTimeout(() => {
            onSectionSaved?.(result.sectionId);
          }, 2000);
        }
      } else {
        setError(result.message || 'Failed to create section');
      }
    } catch {
      setError('Failed to create section. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setSectionName('');
    setDescription('');
    setWordRows([{ id: `row-${Date.now()}`, originalText: '', translationText: '', pronunciation: '' }]);
    setError(null);
    setSuccess(null);
  };

  return (
    <Box>
      <Alert icon={<IconInfoCircle size={16} />} mb="md" style={{ 
        backgroundColor: 'rgba(17, 153, 142, 0.1)', 
        border: '1px solid rgba(17, 153, 142, 0.2)',
        color: '#11998e'
      }}>
        Create a new vocabulary section by providing a name and adding words manually. You can also paste from Excel (Ctrl+V).
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

      {/* Section Details */}
      <Paper withBorder p="lg" radius="md" mb="md">
        <Stack gap="md">
          <TextInput
            label="Section Name"
            placeholder={`e.g., "Essential Phrases", "Business Vocabulary"`}
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            required
            disabled={saving}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Describe what this section covers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            minRows={2}
          />
        </Stack>
      </Paper>

      {/* Word Input Section */}
      <Paper withBorder p="lg" radius="md" mb="md">
        <Stack gap="sm">
          {wordRows.map((row, index) => (
            <Paper key={row.id} p="sm" withBorder>
              <Group align="flex-end" wrap="nowrap">
                <TextInput
                  label={index === 0 ? `${language.toUpperCase()} Word` : undefined}
                  placeholder={`Enter ${language} text...`}
                  value={row.originalText}
                  onChange={(e) => updateRow(row.id, 'originalText', e.target.value)}
                  onPaste={(e) => handlePaste(e, row.id, 'originalText')}
                  style={{ flex: 1 }}
                  disabled={saving}
                />
                <TextInput
                  label={index === 0 ? "English Translation" : undefined}
                  placeholder="Enter English translation..."
                  value={row.translationText}
                  onChange={(e) => updateRow(row.id, 'translationText', e.target.value)}
                  onPaste={(e) => handlePaste(e, row.id, 'translationText')}
                  style={{ flex: 1 }}
                  disabled={saving}
                />
                <TextInput
                  label={index === 0 ? "Pronunciation" : undefined}
                  placeholder="Enter pronunciation (optional)..."
                  value={row.pronunciation || ''}
                  onChange={(e) => updateRow(row.id, 'pronunciation', e.target.value)}
                  style={{ flex: 0.8 }}
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
            style={{
              backgroundColor: 'rgba(17, 153, 142, 0.1)',
              color: '#11998e',
              border: '1px solid rgba(17, 153, 142, 0.2)'
            }}
          >
            Add Word
          </Button>
          
          <Group>
            <Button
              variant="default"
              onClick={clearForm}
              disabled={saving}
            >
              Clear All
            </Button>
            <Button
              onClick={createSection}
              loading={saving}
              style={{
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)',
                border: 'none'
              }}
            >
              Create Section
            </Button>
          </Group>
        </Group>
      </Paper>
    </Box>
  );
}