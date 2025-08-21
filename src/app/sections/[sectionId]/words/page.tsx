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
  Badge,
  Button,
  LoadingOverlay,
  Alert,
  Paper,
  Grid,
  Divider,
  Pagination,
  Affix,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { IconArrowLeft, IconBook, IconEye, IconEyeOff } from '@tabler/icons-react';
import GoBack from '@/components/GoBack';

interface Word {
  wordId: number;
  hebrewText: string;
  englishTranslation: string;
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
}

export default function WordsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const sectionId = params.sectionId as string;

  const [words, setWords] = useState<Word[]>([]);
  const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const wordsPerPage = 100;

  const fetchSectionInfo = useCallback(async () => {
    if (!sectionId) return;
    
    try {
      const response = await fetch(`/api/sections/${sectionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch section information');
      }
      const data = await response.json();
      setSectionInfo(data);
    } catch (error) {
      console.error('Error fetching section info:', error);
      setError('Failed to load section information');
    }
  }, [sectionId]);

  const fetchWords = useCallback(async () => {
    if (!sectionId) return;
    
    try {
      setLoading(true);
      // Calculate offset for pagination
      const offset = (currentPage - 1) * wordsPerPage;
      
      // Fetch words for current page
      const response = await fetch(`/api/words?sectionId=${sectionId}&length=${wordsPerPage}&simple=true&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      const data = await response.json();
      
      // Handle the new paginated response format
      if (data.words) {
        setWords(data.words);
        setTotalWords(data.totalWords || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        // Fallback for non-paginated responses
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
  }, [sectionId, currentPage, wordsPerPage, sectionInfo]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSectionInfo();
    } else if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, fetchSectionInfo, router]);

  useEffect(() => {
    if (status === 'authenticated' && sectionId) {
      setCurrentPage(1); // Reset to first page when section changes
    }
  }, [status, sectionId]);

  useEffect(() => {
    if (status === 'authenticated' && sectionId) {
      fetchWords();
    }
  }, [status, sectionId, currentPage, fetchWords]);

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
        <GoBack />
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              📚 {sectionInfo?.name || 'Section Words'}
            </Title>
            {sectionInfo?.description && (
              <Text c="dimmed" size="lg">
                {sectionInfo.description}
              </Text>
            )}
          </div>
          <GoBack />
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
               Words ({totalWords > 0 ? totalWords : words.length})
             </Text>
             {totalPages > 1 && (
               <Text size="sm" c="dimmed">
                 Page {currentPage} of {totalPages}
               </Text>
             )}
           </div>
         </Group>

        <Divider />

                 {/* Words Grid */}
         <LoadingOverlay visible={loading} />
         <Grid gutter="md">
           {words.map((word, index) => (
             <Grid.Col key={word.wordId} span={{ base: 12, sm: 6, md: 4 }}>
               <Card 
                 shadow="sm" 
                 padding="lg" 
                 radius="md" 
                 withBorder
                 style={{
                   height: '100%',
                   background: word.progress?.isManuallyLearned 
                     ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1))'
                     : 'white'
                 }}
               >
                 <Stack gap="xs">
                   {/* Hebrew Text */}
                   <div>
                     <Text size="lg" fw={700} ta="center" style={{ direction: 'rtl' }}>
                       {word.hebrewText}
                     </Text>
                   </div>

                   {/* Translation */}
                   {showTranslations && (
                     <div>
                       <Text size="md" c="dimmed" ta="center">
                         {word.englishTranslation}
                       </Text>
                       </div>
                   )}

                   {/* Progress Badges */}
                   <Group justify="center" gap="xs">
                     {word.progress?.isManuallyLearned && (
                       <Badge color="green" variant="light" size="sm">
                         ✅ Learned
                       </Badge>
                     )}
                     {word.progress && word.progress.timesSeen > 0 && (
                       <Badge color="blue" variant="light" size="sm">
                         👁️ {word.progress.timesSeen} seen
                       </Badge>
                     )}
                     {word.progress && (word.progress.correctCount > 0 || word.progress.incorrectCount > 0) && (
                       <Badge color="orange" variant="light" size="sm">
                         📊 {word.progress.correctCount}/{word.progress.correctCount + word.progress.incorrectCount}
                       </Badge>
                     )}
                   </Group>

                   {/* Word Number */}
                   <Text size="xs" c="dimmed" ta="center">
                     Word #{((currentPage - 1) * wordsPerPage) + index + 1}
                   </Text>
                 </Stack>
               </Card>
             </Grid.Col>
           ))}
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

         {/* Floating Translation Toggle Button */}
         <Affix position={{ bottom: 20, right: 20 }}>
           <Tooltip
             label={showTranslations ? 'Hide Translations' : 'Show Translations'}
             position="left"
             withArrow
           >
             <ActionIcon
               size="xl"
               radius="xl"
               variant="filled"
               color={showTranslations ? "blue" : "gray"}
               onClick={() => setShowTranslations(!showTranslations)}
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
               {showTranslations ? <IconEyeOff size={24} /> : <IconEye size={24} />}
             </ActionIcon>
           </Tooltip>
         </Affix>
      </Stack>
    </Container>
  );
}
