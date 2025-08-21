'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Text, Button, Card, Group } from '@mantine/core';

interface WordProgress {
  wordId: number;
  hebrewText: string;
  englishTranslation: string;
  repetition: number;
  isManuallyLearned: boolean;
  easinessFactor: number;
  interval: number;
  nextReviewDate: string;
  quality: number | null;
  timesSeen: number;
  correctCount: number;
  incorrectCount: number;
}

interface WordData {
  wordId: number;
  hebrewText: string;
  englishTranslation: string;
}

interface TestResult {
  message: string;
  data?: unknown;
}

export default function DebugLearningPage() {
  const { data: session, status } = useSession();
  const [words, setWords] = useState<WordProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const fetchWords = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/words?sectionId=1&length=10&simple=true');
      if (response.ok) {
        const wordData = await response.json();
        
        // Get progress for each word
        const wordsWithProgress = await Promise.all(
          wordData.map(async (word: WordData) => {
            const progressResponse = await fetch(`/api/progress?wordId=${word.wordId}`);
            if (progressResponse.ok) {
              const progress = await progressResponse.json();
              return {
                wordId: word.wordId,
                hebrewText: word.hebrewText,
                englishTranslation: word.englishTranslation,
                ...progress
              };
            }
            return {
              wordId: word.wordId,
              hebrewText: word.hebrewText,
              englishTranslation: word.englishTranslation,
              repetition: 0,
              isManuallyLearned: false,
              easinessFactor: 2.5,
              interval: 1,
              nextReviewDate: new Date().toISOString(),
              quality: null,
              timesSeen: 0,
              correctCount: 0,
              incorrectCount: 0
            };
          })
        );
        
        setWords(wordsWithProgress);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const testSM2 = async (wordId: number) => {
    try {
      const response = await fetch(`/api/test-sm2?wordId=${wordId}`);
      if (response.ok) {
        const result = await response.json();
        setTestResult(result);
      }
    } catch (error) {
      console.error('Error testing SM2:', error);
    }
  };

  const simulateCorrectAnswer = async (wordId: number) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId,
          isCorrect: true,
          responseTime: 2000,
          sessionWordAttempts: 1,
        }),
      });
      
      if (response.ok) {
        await response.json();
        // Refresh the words list
        await fetchWords();
      }
    } catch (error) {
      console.error('Error simulating answer:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWords();
    }
  }, [status, fetchWords]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Text size="2xl" fw={700} mb="lg">Learning Debug Page</Text>
      
      <Group mb="lg">
        <Button onClick={fetchWords} loading={loading}>
          Refresh Words
        </Button>
      </Group>

      {testResult && (
        <Card mb="lg" p="md">
          <Text size="lg" fw={600} mb="md">SM2 Test Result</Text>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </Card>
      )}

      <div className="space-y-4">
        {words.map((word) => (
          <Card key={word.wordId} p="md" withBorder>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Text size="lg" fw={600}>
                  {word.hebrewText} - {word.englishTranslation}
                </Text>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <Text fw={500}>Repetition: {word.repetition}</Text>
                    <Text fw={500}>Learned: {word.isManuallyLearned ? 'Yes' : 'No'}</Text>
                    <Text fw={500}>Times Seen: {word.timesSeen}</Text>
                  </div>
                  <div>
                    <Text fw={500}>Correct: {word.correctCount}</Text>
                    <Text fw={500}>Incorrect: {word.incorrectCount}</Text>
                    <Text fw={500}>EF: {word.easinessFactor.toFixed(2)}</Text>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => testSM2(word.wordId)}
                >
                  Test SM2
                </Button>
                <Button 
                  size="sm" 
                  color="green"
                  onClick={() => simulateCorrectAnswer(word.wordId)}
                >
                  Simulate Correct
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
