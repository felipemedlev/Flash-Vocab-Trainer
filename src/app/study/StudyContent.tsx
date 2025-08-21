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
  Group,
  Badge,
  Progress,
  Card,
  Stack,
  SimpleGrid
} from '@mantine/core';

interface Section {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdByUserId: number | null;
  createdAt: string;
  words: unknown[];
  totalWords: number;
  learnedWords: number;
}

interface WordRow {
  id: string;
  hebrewText: string;
  englishTranslation: string;
}

export default function StudyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get('sectionId');
  const { status } = useSession();

  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [sessionLength, setSessionLength] = useState('10');
  const [studyMode, setStudyMode] = useState<'all' | 'difficult'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWordInput, setShowWordInput] = useState(false);
  const [wordRows, setWordRows] = useState<WordRow[]>([]);
  const [saving, setSaving] = useState(false);

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
          setSectionData(data);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSectionDetails();
  }, [sectionId, status, router]);

  // Initialize word rows when component mounts
  useEffect(() => {
    if (wordRows.length === 0) {
      initializeWordRows();
    }
  }, [wordRows.length]);

  const initializeWordRows = () => {
    const initialRows: WordRow[] = Array.from({ length: 5 }, (_, index) => ({
      id: `row-${Date.now()}-${index}`,
      hebrewText: '',
      englishTranslation: ''
    }));
    setWordRows(initialRows);
  };

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

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>, rowId: string, field: 'hebrewText' | 'englishTranslation') => {
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
    if (!sectionId) return;
    
    const validWords = wordRows.filter(row => 
      row.hebrewText.trim() !== '' && row.englishTranslation.trim() !== ''
    );
    
    if (validWords.length === 0) {
      alert('Please add at least one word with both Hebrew and English text.');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: parseInt(sectionId as string),
          words: validWords.map(row => ({
            hebrewText: row.hebrewText.trim(),
            englishTranslation: row.englishTranslation.trim()
          }))
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`Successfully added ${result.addedCount} words!${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates were skipped)` : ''}`);
        // Clear the form and refresh section data
        initializeWordRows();
        setShowWordInput(false);
        // Refresh section data to show updated word count
        if (sectionId && status === 'authenticated') {
          try {
            const response = await fetch(`/api/sections/${sectionId}`);
            if (response.ok) {
              const data = await response.json();
              setSectionData(data);
            }
          } catch (error) {
            console.error("Failed to refresh section data:", error);
          }
        }
      } else {
        alert(result.message || 'Failed to save words');
      }
    } catch (error) {
      console.error('Error saving words:', error);
      alert('Failed to save words. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const estimatedTime = (parseInt(sessionLength) / 10) * 1;
  const progressPercentage = sectionData ? 
    (sectionData.totalWords > 0 ? (sectionData.learnedWords / sectionData.totalWords) * 100 : 0) : 0;

  const handleStartStudy = () => {
    if (sectionId) {
      router.push(
        `/study/flashcard?sectionId=${sectionId}&length=${sessionLength}&mode=${studyMode}`
      );
    }
  };

  const handleGoBack = () => {
    router.push('/sections');
  };

  if (status === 'loading' || loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="lg" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert color="red" mb="md">
          ❌ {error}
        </Alert>
        <Button onClick={handleGoBack}>
          ← Back to Sections
        </Button>
      </Container>
    );
  }

  if (status === 'authenticated' && sectionData) {
    const wordsLeft = sectionData.totalWords - sectionData.learnedWords;
    const isCompleted = wordsLeft === 0;
    
    return (
      <Container size="md">
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Button variant="subtle" onClick={handleGoBack}>
            ← Back to Sections
          </Button>
          <Badge color={isCompleted ? 'green' : 'blue'} size="lg">
            {isCompleted ? '✅ Completed' : `${wordsLeft} words left`}
          </Badge>
        </Group>

        {/* Section Info */}
        <Paper withBorder p="lg" radius="md" mb="xl" style={{ background: 'linear-gradient(135deg, #667eea10, #764ba210)' }}>
          <Group justify="space-between" align="start" mb="md">
            <div>
              <Title order={2} mb="xs">{sectionData.name} 📚</Title>
              <Text c="dimmed" size="md">
                {sectionData.description || "Master essential Hebrew vocabulary"}
              </Text>
            </div>
          </Group>

          {/* Progress Bar */}
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>Your Progress</Text>
              <Text size="sm" c="dimmed">{Math.round(progressPercentage)}%</Text>
            </Group>
            <Progress 
              value={progressPercentage} 
              size="lg" 
              radius="md" 
              color={isCompleted ? 'green' : 'blue'}
              mb="md"
            />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {sectionData.learnedWords} words learned
              </Text>
              <Text size="sm" c="dimmed">
                {sectionData.totalWords} total words
              </Text>
            </Group>
          </div>
        </Paper>

        {/* Study Setup */}
        <Paper withBorder p="lg" radius="md" mb="xl">
          <Title order={3} mb="lg">
            {isCompleted ? '🔄 Review Session Setup' : '🚀 Study Session Setup'}
          </Title>
          
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {/* Session Length */}
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={500} mb="md">📊 Session Length</Text>
              <Select
                value={sessionLength}
                onChange={(value) => setSessionLength(value || '10')}
                data={[
                  { value: '5', label: '5 Words (Quick Review)' },
                  { value: '10', label: '10 Words (Recommended)' },
                  { value: '20', label: '20 Words (Extended)' },
                  { value: '50', label: '50 Words (Marathon)' },
                  {
                    value: Math.min(sectionData.totalWords, wordsLeft || sectionData.totalWords).toString(),
                    label: isCompleted ? 
                      `All Words (${sectionData.totalWords})` : 
                      `Remaining Words (${wordsLeft})`,
                  },
                ]}
                size="md"
              />
              <Text size="sm" c="dimmed" mt="xs">
                ⏱️ Estimated time: ~{estimatedTime} minutes
              </Text>
            </Card>

            {/* Study Mode */}
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={500} mb="md">🎯 Study Mode</Text>
              <Radio.Group
                value={studyMode}
                onChange={(value) => setStudyMode(value as 'all' | 'difficult')}
              >
                <Stack gap="sm">
                  <Radio 
                    value="all" 
                    label="All Words"
                    description="Practice all available words"
                  />
                  <Radio 
                    value="difficult" 
                    label="Difficult Words Only"
                    description="Focus on challenging vocabulary"
                  />
                </Stack>
              </Radio.Group>
            </Card>
          </SimpleGrid>
        </Paper>

        {/* Action Buttons */}
        <Paper withBorder p="lg" radius="md" style={{ textAlign: 'center' }}>
          <Group justify="center" gap="lg">
            <Button 
              size="xl" 
              onClick={handleStartStudy}
              style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '12px 32px'
              }}
            >
              {isCompleted ? '🔄 Start Review' : '🚀 Begin Study Session'}
            </Button>
          </Group>
          
          {!isCompleted && (
            <Text size="sm" c="dimmed" mt="lg">
              💡 Pro tip: Start with 10 words to build momentum, then increase as you get comfortable!
            </Text>
          )}
          
          {isCompleted && (
            <Alert color="green" variant="light" mt="lg">
              <Stack gap="xs">
                <Text fw={500}>🎉 Section Completed!</Text>
                <Text size="sm">
                  Congratulations! You&apos;ve mastered all words in this section. 
                  Regular review will help maintain your knowledge.
                </Text>
                <Group gap="xs" mt="xs">
                  <Badge color="green" variant="light">✅ All words learned</Badge>
                  <Badge color="blue" variant="light">📈 Progress saved</Badge>
                </Group>
              </Stack>
            </Alert>
          )}
        </Paper>

        {/* Add Words Section */}
        <Paper withBorder p="lg" radius="md" mt="xl">
          <Group justify="space-between" align="center" mb="lg">
            <Title order={3}>📝 Add New Words</Title>
            <Button 
              variant={showWordInput ? "filled" : "outline"}
              onClick={() => setShowWordInput(!showWordInput)}
              size="md"
            >
              {showWordInput ? '📚 Back to Study' : '➕ Add Words'}
            </Button>
          </Group>

          {showWordInput && (
            <div>
              <Text size="sm" c="dimmed" mb="md" style={{ textAlign: 'center' }}>
                Add new words to this section. You can type directly or paste from Excel (Ctrl+V).
              </Text>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  border: '1px solid #dee2e6',
                  marginBottom: '1rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ 
                        border: '1px solid #dee2e6', 
                        padding: '12px', 
                        textAlign: 'left',
                        fontWeight: 'bold',
                        width: '45%'
                      }}>
                        Hebrew
                      </th>
                      <th style={{ 
                        border: '1px solid #dee2e6', 
                        padding: '12px', 
                        textAlign: 'left',
                        fontWeight: 'bold',
                        width: '45%'
                      }}>
                        English
                      </th>
                      <th style={{ 
                        border: '1px solid #dee2e6', 
                        padding: '12px', 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        width: '10%'
                      }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {wordRows.map((row) => (
                      <tr key={row.id} style={{ 
                        backgroundColor: '#fff',
                        transition: 'background-color 0.2s'
                      }}>
                        <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                          <textarea
                            value={row.hebrewText}
                            onChange={(e) => updateRow(row.id, 'hebrewText', e.target.value)}
                            onPaste={(e) => handlePaste(e, row.id, 'hebrewText')}
                            placeholder="Enter Hebrew text..."
                            style={{
                              width: '100%',
                              minHeight: '40px',
                              resize: 'none',
                              border: 'none',
                              outline: 'none',
                              backgroundColor: 'transparent',
                              textAlign: 'right',
                              direction: 'rtl',
                              fontFamily: 'inherit',
                              fontSize: '14px'
                            }}
                            rows={1}
                          />
                        </td>
                        <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                          <textarea
                            value={row.englishTranslation}
                            onChange={(e) => updateRow(row.id, 'englishTranslation', e.target.value)}
                            onPaste={(e) => handlePaste(e, row.id, 'englishTranslation')}
                            placeholder="Enter English translation..."
                            style={{
                              width: '100%',
                              minHeight: '40px',
                              resize: 'none',
                              border: 'none',
                              outline: 'none',
                              backgroundColor: 'transparent',
                              fontFamily: 'inherit',
                              fontSize: '14px'
                            }}
                            rows={1}
                          />
                        </td>
                        <td style={{ 
                          border: '1px solid #dee2e6', 
                          padding: '8px', 
                          textAlign: 'center' 
                        }}>
                          {wordRows.length > 1 && (
                            <button
                              onClick={() => removeRow(row.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#e03131',
                                fontSize: '18px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                              title="Remove row"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Group justify="space-between" align="center">
                <Button
                  onClick={addNewRow}
                  variant="outline"
                  color="green"
                  leftSection="+"
                >
                  Add Row
                </Button>
                
                <Group gap="sm">
                  <Button
                    onClick={() => {
                      initializeWordRows();
                      setShowWordInput(false);
                    }}
                    variant="outline"
                    color="gray"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveWords}
                    loading={saving}
                    color="blue"
                  >
                    {saving ? 'Saving...' : 'Save Words'}
                  </Button>
                </Group>
              </Group>
            </div>
          )}

          {!showWordInput && (
            <Text size="sm" c="dimmed" style={{ textAlign: 'center' }}>
              Click "Add Words" to expand this section with Hebrew and English vocabulary. 
              You can type directly or paste from Excel spreadsheets.
            </Text>
          )}
        </Paper>
      </Container>
    );
  }

  return null;
}