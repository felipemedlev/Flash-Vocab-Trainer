"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Container,
  Title,
  Card,
  Text,
  Progress,
  Badge,
  Group,
  Loader,
  Alert,
  Button,
  Paper,
  SimpleGrid,
  Stack
} from "@mantine/core";

interface Section {
  id: number;
  name: string;
  description: string | null;
  totalWords: number;
  learnedWords: number;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchSections() {
      if (status === 'authenticated') {
        try {
          const response = await fetch("/api/sections");
          if (response.ok) {
            const data = await response.json();
            setSections(data);
          }
        } catch (error) {
          console.error("Failed to fetch sections:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchSections();
  }, [status]);

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'green';
    if (percentage >= 75) return 'lime';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 25) return 'orange';
    return 'blue';
  };

  const getSectionStatus = (learned: number, total: number) => {
    const percentage = total > 0 ? (learned / total) * 100 : 0;
    if (percentage === 100) return { label: 'Completed ✅', color: 'green' };
    if (percentage >= 50) return { label: 'In Progress 📚', color: 'orange' };
    if (percentage > 0) return { label: 'Started 🚀', color: 'blue' };
    return { label: 'New ✨', color: 'gray' };
  };

  const estimateTime = (wordsLeft: number) => {
    const minutesPerWord = 0.5; // Estimate 30 seconds per word
    const totalMinutes = Math.ceil(wordsLeft * minutesPerWord);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const totalWords = sections.reduce((sum, section) => sum + section.totalWords, 0);
  const totalLearned = sections.reduce((sum, section) => sum + section.learnedWords, 0);
  const overallProgress = totalWords > 0 ? (totalLearned / totalWords) * 100 : 0;
  const completedSections = sections.filter(s => s.learnedWords === s.totalWords).length;

  if (status === 'loading' || loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="lg" />
      </Container>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <Container size="xl">
      {/* Header with back button */}
      <Group justify="space-between" mb="xl">
        <div>
          <Group mb="xs">
            <Button 
              variant="subtle" 
              size="sm" 
              component={Link} 
              href="/dashboard"
            >
              ← Back to Dashboard
            </Button>
          </Group>
          <Title order={1}>Choose Your Learning Path 🎯</Title>
          <Text size="lg" c="dimmed">Select a section to continue your Hebrew journey</Text>
        </div>
      </Group>

      {/* Overall Progress */}
      <Paper withBorder p="lg" radius="md" mb="xl" style={{ background: 'linear-gradient(135deg, #667eea10, #764ba210)' }}>
        <Group justify="space-between" mb="md">
          <Title order={3}>Your Overall Progress 📊</Title>
          <Badge size="lg" color={overallProgress === 100 ? 'green' : 'blue'}>
            {Math.round(overallProgress)}% Complete
          </Badge>
        </Group>
        <Progress value={overallProgress} size="lg" radius="md" mb="md" />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <div>
            <Text size="sm" c="dimmed">Total Words</Text>
            <Text size="xl" fw={700}>{totalWords}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Words Learned</Text>
            <Text size="xl" fw={700} c="blue">{totalLearned}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Sections Completed</Text>
            <Text size="xl" fw={700} c="green">{completedSections}/{sections.length}</Text>
          </div>
        </SimpleGrid>
      </Paper>

      {/* Motivational message */}
      {overallProgress < 100 && (
        <Alert color="blue" variant="light" mb="xl">
          💪 You&apos;re doing great! Keep going to master Hebrew vocabulary.
        </Alert>
      )}

      {/* Sections Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {sections.map((section) => {
          const progress = section.totalWords > 0 ? (section.learnedWords / section.totalWords) * 100 : 0;
          const status = getSectionStatus(section.learnedWords, section.totalWords);
          const wordsLeft = section.totalWords - section.learnedWords;
          
          return (
            <Card 
              key={section.id}
              shadow="md" 
              padding="lg" 
              radius="md" 
              withBorder
              component={Link}
              href={`/study?sectionId=${section.id}`}
              style={{ 
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              className="hover:shadow-xl hover:scale-105"
            >
              <Stack gap="md">
                {/* Section Header */}
                <Group justify="space-between">
                  <Text size="xl" fw={600}>{section.name}</Text>
                  <Badge color={status.color} variant="light">
                    {status.label}
                  </Badge>
                </Group>

                {/* Description */}
                <Text c="dimmed" size="sm" style={{ minHeight: '40px' }}>
                  {section.description || "Master essential Hebrew vocabulary"}
                </Text>

                {/* Progress */}
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>Progress</Text>
                    <Text size="sm" c="dimmed">{Math.round(progress)}%</Text>
                  </Group>
                  <Progress 
                    value={progress} 
                    color={getProgressColor(progress)} 
                    size="md" 
                    radius="md" 
                  />
                </div>

                {/* Stats */}
                <Group justify="space-between">
                  <div>
                    <Text size="xs" c="dimmed">Words</Text>
                    <Text size="sm" fw={500}>
                      {section.learnedWords} / {section.totalWords}
                    </Text>
                  </div>
                  {wordsLeft > 0 && (
                    <div>
                      <Text size="xs" c="dimmed">Est. Time</Text>
                      <Text size="sm" fw={500}>
                        {estimateTime(wordsLeft)}
                      </Text>
                    </div>
                  )}
                  {progress === 100 && (
                    <div>
                      <Text size="xs" c="dimmed">Status</Text>
                      <Text size="sm" fw={500} c="green">
                        🏆 Mastered!
                      </Text>
                    </div>
                  )}
                </Group>

                {/* Action Button */}
                <Button 
                  fullWidth 
                  variant={progress === 100 ? "light" : "filled"}
                  color={progress === 100 ? "green" : "blue"}
                  style={{ marginTop: 'auto' }}
                >
                  {progress === 100 ? "🔄 Review" : progress > 0 ? "📚 Continue" : "🚀 Start Learning"}
                </Button>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Empty state */}
      {sections.length === 0 && (
        <Paper withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
          <Text size="xl" fw={500} mb="md">📚 No sections available yet</Text>
          <Text c="dimmed" mb="lg">
            Sections will appear here once they&apos;re uploaded by administrators.
          </Text>
          <Button component={Link} href="/dashboard">
            Return to Dashboard
          </Button>
        </Paper>
      )}

      {/* Footer encouragement */}
      {sections.length > 0 && overallProgress < 100 && (
        <Paper withBorder p="lg" radius="md" mt="xl" style={{ textAlign: 'center', background: 'linear-gradient(45deg, #e3f2fd, #f3e5f5)' }}>
          <Text size="lg" fw={500} mb="xs">🌟 Every word learned is a step closer to fluency!</Text>
          <Text c="dimmed">Choose a section above to continue your Hebrew learning adventure.</Text>
        </Paper>
      )}
    </Container>
  );
}