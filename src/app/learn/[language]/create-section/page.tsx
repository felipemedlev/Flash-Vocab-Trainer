'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Title,
  Text,
  Group,
  ActionIcon,
  Paper,
  Stack,
  Tabs,
  Alert,
  List,
  ThemeIcon,
  Button,
  Divider,
  FileInput,
  TextInput,
  Textarea,
  Progress,
  Badge
} from '@mantine/core';
import {
  IconArrowLeft,
  IconUpload,
  IconEdit,
  IconInfoCircle,
  IconDownload,
  IconCopy,
  IconFile,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { getLanguageConfig, isValidLanguageCode } from '@/config/languages';
import { LanguageDisplay } from '@/components/LanguageText';
import SectionInput from '@/components/SectionInput';

export default function CreateSectionPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const language = params.language as string;
  const [activeTab, setActiveTab] = useState<string | null>('manual');

  // Upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploadSectionName, setUploadSectionName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const languageConfig = getLanguageConfig(language);

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  if (!isValidLanguageCode(language) || !languageConfig) {
    router.push('/');
    return null;
  }

  const handleSectionSaved = () => {
    // Redirect to the sections page after successful creation
    router.push(`/learn/${language}/sections`);
  };

  const downloadTemplate = () => {
    // Create language-specific CSV templates
    const getTemplateContent = (langCode: string) => {
      const templates: Record<string, string> = {
        he: 'שלום,hello\nתודה,thank you\nבבקשה,please',
        es: 'hola,hello\ngracias,thank you\npor favor,please',
        fr: 'bonjour,hello\nmerci,thank you\ns\'il vous plaît,please',
        it: 'ciao,hello\ngrazie,thank you\nper favore,please',
        de: 'hallo,hello\ndanke,thank you\nbitte,please',
        ru: 'привет,hello\nспасибо,thank you\nпожалуйста,please',
        zh: '你好,hello\n谢谢,thank you\n请,please',
        pt: 'olá,hello\nobrigado,thank you\npor favor,please',
        ja: 'こんにちは,hello\nありがとう,thank you\nお願いします,please',
        ar: 'مرحبا,hello\nشكرا,thank you\nمن فضلك,please'
      };
      return templates[langCode] || 'word1,translation1\nword2,translation2\nword3,translation3';
    };

    const csvContent = `${languageConfig.name},English\n${getTemplateContent(language)}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${language}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file || !uploadSectionName.trim()) {
      setUploadError('Please provide both a file and section name');
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sectionName', uploadSectionName.trim());
      formData.append('language', language);
      if (uploadDescription.trim()) {
        formData.append('description', uploadDescription.trim());
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadSuccess(`Section "${uploadSectionName}" created successfully with ${result.wordsCount || 'multiple'} words!`);
        setFile(null);
        setUploadSectionName('');
        setUploadDescription('');
        
        // Redirect to the new section after a delay
        setTimeout(() => {
          router.push(`/learn/${language}/sections`);
        }, 2000);
      } else {
        setUploadError(result.message || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Network error during upload');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  return (
    <Container size="md" py="xl">
      {/* Header */}
      <Group gap="md" align="center" mb="xl">
        <ActionIcon
          variant="light"
          size="lg"
          onClick={() => router.push(`/learn/${language}/sections`)}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <div>
          <Group gap="sm" align="center">
            <Title order={1}>Create New Section</Title>
            <LanguageDisplay language={language} showFlag={true} />
          </Group>
          <Text c="dimmed">
            Create a new custom {languageConfig.name} vocabulary section
          </Text>
        </div>
      </Group>

      {/* Method Selection */}
      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List grow>
          <Tabs.Tab value="manual" leftSection={<IconEdit size={16} />}>
            Manual Entry
          </Tabs.Tab>
          <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
            Upload File
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="manual" pt="md">
          {/* Excel Copy/Paste Instructions */}
          <Paper withBorder p="lg" radius="md" bg="blue.0" mb="md">
            <Stack gap="md">
              <Group gap="sm">
                <IconCopy size={20} color="var(--mantine-color-blue-6)" />
                <Text fw={600} c="blue">Excel Copy & Paste Feature</Text>
              </Group>
              
              <Alert color="blue" variant="light">
                <Text size="sm">
                  <strong>Pro Tip:</strong> You can copy data directly from Excel or Google Sheets and paste it into the form below!
                </Text>
              </Alert>
              
              <List spacing="xs" size="sm">
                <List.Item icon={<ThemeIcon size={20} radius="xl" color="blue"><Text size="xs">1</Text></ThemeIcon>}>
                  Prepare your data in Excel with columns: {languageConfig.name} | English | Pronunciation (optional)
                </List.Item>
                <List.Item icon={<ThemeIcon size={20} radius="xl" color="blue"><Text size="xs">2</Text></ThemeIcon>}>
                  Select and copy your rows (Ctrl+C or Cmd+C)
                </List.Item>
                <List.Item icon={<ThemeIcon size={20} radius="xl" color="blue"><Text size="xs">3</Text></ThemeIcon>}>
                  Click in the first "{languageConfig.name} Word" field below and paste (Ctrl+V or Cmd+V)
                </List.Item>
                <List.Item icon={<ThemeIcon size={20} radius="xl" color="blue"><Text size="xs">4</Text></ThemeIcon>}>
                  All rows will be automatically populated with your data!
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
                  Download Excel Template
                </Button>
              </Group>
            </Stack>
          </Paper>

          {/* Manual Entry Form */}
          <SectionInput
            language={language}
            onSectionSaved={handleSectionSaved}
          />
        </Tabs.Panel>

        <Tabs.Panel value="upload" pt="md">
          {/* File Upload Instructions */}
          <Paper withBorder p="lg" radius="md" bg="green.0" mb="md">
            <Stack gap="md">
              <Group gap="sm">
                <IconUpload size={20} color="var(--mantine-color-green-6)" />
                <Text fw={600} c="green">File Upload Method</Text>
              </Group>
              
              <List spacing="xs" size="sm">
                <List.Item icon={<ThemeIcon size={20} radius="xl" color="green"><Text size="xs">1</Text></ThemeIcon>}>
                  Create an Excel file (.xlsx or .xls) or CSV file with two columns: "{languageConfig.name}" and "English"
                </List.Item>
                <List.Item icon={<ThemeIcon size={20} radius="xl" color="green"><Text size="xs">2</Text></ThemeIcon>}>
                  Add your vocabulary words with translations (up to 500 words)
                </List.Item>
                <List.Item icon={<ThemeIcon size={20} radius="xl" color="green"><Text size="xs">3</Text></ThemeIcon>}>
                  Upload your file using the form below
                </List.Item>
                <List.Item icon={<ThemeIcon size={20} radius="xl" color="green"><Text size="xs">4</Text></ThemeIcon>}>
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

          {/* Language-specific tips */}
          <Paper withBorder p="lg" radius="md" bg="gray.0" mb="md">
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

              {language === 'ar' && (
                <List spacing="xs" size="sm">
                  <List.Item>Use Arabic script (العربية) in the Arabic column</List.Item>
                  <List.Item>Text direction will be automatically handled (RTL)</List.Item>
                  <List.Item>Include diacritical marks (tashkeel) for better pronunciation</List.Item>
                </List>
              )}

              {['es', 'fr', 'it', 'pt'].includes(language) && (
                <List spacing="xs" size="sm">
                  <List.Item>Include accent marks and special characters as needed</List.Item>
                  <List.Item>Both formal and informal expressions work well</List.Item>
                  <List.Item>Consider regional variations in your translations</List.Item>
                </List>
              )}

              {language === 'de' && (
                <List spacing="xs" size="sm">
                  <List.Item>Include German umlauts (ä, ö, ü) and ß character</List.Item>
                  <List.Item>Consider including article (der/die/das) for nouns</List.Item>
                  <List.Item>Both formal (Sie) and informal (du) forms work well</List.Item>
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

          {/* Upload Form */}
          <Paper withBorder p="lg" radius="md">
            <Stack gap="md">
              <Title order={3}>Upload Details</Title>

              <TextInput
                label="Section Name"
                placeholder={`e.g., "Essential ${languageConfig.name} Phrases"`}
                value={uploadSectionName}
                onChange={(e) => setUploadSectionName(e.target.value)}
                required
                disabled={uploading}
              />

              <Textarea
                label="Description (Optional)"
                placeholder={`Describe what this ${languageConfig.name} section covers...`}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                disabled={uploading}
                minRows={2}
              />

              <FileInput
                label={`${languageConfig.name} Vocabulary File`}
                placeholder="Select your Excel or CSV file"
                accept=".xlsx,.xls,.csv"
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

              {uploadError && (
                <Alert color="red" icon={<IconX size={16} />}>
                  {uploadError}
                </Alert>
              )}

              {uploadSuccess && (
                <Alert color="green" icon={<IconCheck size={16} />}>
                  {uploadSuccess}
                </Alert>
              )}

              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  onClick={() => {
                    setFile(null);
                    setUploadSectionName('');
                    setUploadDescription('');
                    setUploadError(null);
                    setUploadSuccess(null);
                  }}
                  disabled={uploading}
                >
                  Clear
                </Button>
                <Button
                  leftSection={<IconUpload size={16} />}
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!file || !uploadSectionName.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                    boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Upload Content
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}