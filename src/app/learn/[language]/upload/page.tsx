'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  FileInput,
  TextInput,
  Textarea,
  Alert,
  Progress,
  List,
  ThemeIcon,
  ActionIcon,
  Badge,
  Divider
} from '@mantine/core';
import {
  IconUpload,
  IconFile,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconArrowLeft,
  IconDownload
} from '@tabler/icons-react';
import Link from 'next/link';
import { getLanguageConfig, isValidLanguageCode } from '@/config/languages';
import { LanguageDisplay } from '@/components/LanguageText';

export default function LanguageUploadPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const language = params.language as string;

  const [file, setFile] = useState<File | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const languageConfig = getLanguageConfig(language);

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  if (!isValidLanguageCode(language) || !languageConfig) {
    router.push('/');
    return null;
  }

  const handleUpload = async () => {
    if (!file || !sectionName.trim()) {
      setError('Please provide both a file and section name');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sectionName', sectionName.trim());
      formData.append('language', language);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Section "${sectionName}" created successfully with ${result.wordsCount || 'multiple'} words!`);
        setFile(null);
        setSectionName('');
        setDescription('');
        
        // Redirect to the new section after a delay
        setTimeout(() => {
          router.push(`/learn/${language}/sections`);
        }, 2000);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      setError('Network error during upload');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent = `${languageConfig.name},English\nשלום,hello\nתודה,thank you\nבבקשה,please`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${language}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group gap="md" align="center">
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => router.push(`/learn/${language}/sections`)}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <div>
            <Group gap="sm" align="center">
              <Title order={1}>Upload Content</Title>
              <LanguageDisplay language={language} showFlag={true} />
            </Group>
            <Text c="dimmed">
              Upload your own {languageConfig.name} vocabulary in Excel format
            </Text>
          </div>
        </Group>

        {/* Instructions */}
        <Paper withBorder p="lg" radius="md" bg="blue.0">
          <Stack gap="md">
            <Group gap="sm">
              <IconInfoCircle size={20} color="var(--mantine-color-blue-6)" />
              <Text fw={600} c="blue">How to Upload Content</Text>
            </Group>
            
            <List spacing="xs" size="sm">
              <List.Item icon={<ThemeIcon size={20} radius="xl" color="blue"><Text size="xs">1</Text></ThemeIcon>}>
                Create an Excel file (.xlsx or .xls) with two columns: "{languageConfig.name}" and "English"
              </List.Item>
              <List.Item icon={<ThemeIcon size={20} radius="xl" color="blue"><Text size="xs">2</Text></ThemeIcon>}>
                Add your vocabulary words with translations
              </List.Item>
              <List.Item icon={<ThemeIcon size={20} radius="xl" color="blue"><Text size="xs">3</Text></ThemeIcon>}>
                Maximum 500 words per upload
              </List.Item>
              <List.Item icon={<ThemeIcon size={20} radius="xl" color="blue"><Text size="xs">4</Text></ThemeIcon>}>
                Duplicate words will be automatically removed
              </List.Item>
            </List>

            <Divider />

            <Group justify="center">
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                onClick={downloadTemplate}
                size="sm"
              >
                Download Template
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Upload Form */}
        <Paper withBorder p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Upload Details</Title>

            <TextInput
              label="Section Name"
              placeholder={`e.g., "Essential ${languageConfig.name} Phrases"`}
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              required
              disabled={uploading}
            />

            <Textarea
              label="Description (Optional)"
              placeholder={`Describe what this ${languageConfig.name} section covers...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              minRows={2}
            />

            <FileInput
              label={`${languageConfig.name} Vocabulary File`}
              placeholder="Select your Excel file"
              accept=".xlsx,.xls"
              value={file}
              onChange={setFile}
              leftSection={<IconFile size={16} />}
              disabled={uploading}
              required
            />

            {file && (
              <Alert color="green" icon={<IconCheck size={16} />}>
                File selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Alert>
            )}

            {uploading && (
              <Progress value={progress} striped animated />
            )}

            {error && (
              <Alert color="red" icon={<IconX size={16} />}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert color="green" icon={<IconCheck size={16} />}>
                {success}
              </Alert>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                component={Link}
                href={`/learn/${language}/sections`}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={handleUpload}
                loading={uploading}
                disabled={!file || !sectionName.trim()}
              >
                Upload Content
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Language-specific tips */}
        <Paper withBorder p="lg" radius="md" bg="gray.0">
          <Stack gap="sm">
            <Group gap="sm">
              <Text fw={600}>Tips for {languageConfig.name}</Text>
              <Badge color="gray" variant="light">Language-specific</Badge>
            </Group>
            
            {language === 'he' && (
              <List spacing="xs" size="sm">
                <List.Item>Use Hebrew characters (אבג) in the Hebrew column</List.Item>
                <List.Item>Include vowel marks (niqqud) for better pronunciation</List.Item>
                <List.Item>Text direction will be automatically handled (RTL)</List.Item>
              </List>
            )}
            
            {language === 'zh' && (
              <List spacing="xs" size="sm">
                <List.Item>Use simplified Chinese characters (中文) in the Chinese column</List.Item>
                <List.Item>Consider adding pinyin in a third column for pronunciation</List.Item>
                <List.Item>Tone marks are supported and encouraged</List.Item>
              </List>
            )}
            
            {language === 'ja' && (
              <List spacing="xs" size="sm">
                <List.Item>Use any combination of Hiragana, Katakana, or Kanji</List.Item>
                <List.Item>Consider adding romaji for pronunciation help</List.Item>
                <List.Item>Both formal and casual forms are supported</List.Item>
              </List>
            )}
            
            {language === 'ru' && (
              <List spacing="xs" size="sm">
                <List.Item>Use Cyrillic script (русский) in the Russian column</List.Item>
                <List.Item>Include stress marks where helpful</List.Item>
                <List.Item>Both formal and informal forms work well</List.Item>
              </List>
            )}

            {languageConfig.features?.hasGender && (
              <Text size="sm" c="dimmed">
                💡 This language has grammatical gender - consider noting it in descriptions
              </Text>
            )}

            {languageConfig.features?.hasTones && (
              <Text size="sm" c="dimmed">
                🎵 This language is tonal - tone marks greatly improve learning effectiveness
              </Text>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}