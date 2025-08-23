"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Text } from "@mantine/core";
import { FlashCard } from "@/components/FlashCard";
import { LinearProgress } from "@/components/LinearProgress";

interface Flashcard {
  wordId: number;
  originalText: string;
  pronunciation?: string;
  correctTranslation: string;
  options: string[];
  level: 'new' | 'learning' | 'review' | 'mastered';
}

export default function FlashcardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const sectionId = params.sectionId as string;
  const language = params.language as string;
  const sessionLength = searchParams.get("length");
  const { status } = useSession();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0); // New state for loading progress
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correctAnswers: 0,
    totalAnswers: 0,
    startTime: Date.now(),
    wordsLearnedInSession: 0
  });

  const [sessionWordsLearned, setSessionWordsLearned] = useState(0);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [sessionWordAttempts, setSessionWordAttempts] = useState<Record<number, number>>({});
  const [preloadedCardIndex, setPreloadedCardIndex] = useState<number | null>(null);
  const [progressQueue, setProgressQueue] = useState<Array<{
    wordId: number;
    isCorrect: boolean;
    responseTime: number;
    sessionWordAttempts: number;
    timestamp: number;
  }>>([]);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchFlashcards = useCallback(async () => {
    if (!sectionId) {
      setError("Missing section ID.");
      setLoading(false);
      return;
    }

    // Prevent multiple fetches
    if (hasFetchedRef.current) {
      return;
    }

    // Provide default values for missing parameters
    const defaultLength = 10;
    const actualLength = sessionLength || defaultLength.toString();
    if (status === "authenticated") {
      try {
        setLoadingProgress(0); // Start loading from 0
        hasFetchedRef.current = true;
        // Validate and limit session length to prevent performance issues
        const validatedLength = Math.min(parseInt(actualLength), 100);

        setLoadingProgress(25); // Progress after validation
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
          `/api/words?sectionId=${sectionId}&length=${validatedLength}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);
        setLoadingProgress(75); // Progress after fetch
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Flashcard[] = await response.json();
        if (data.length === 0) {
          setError("No words to study in this section with the selected criteria.");
        }
        setFlashcards(data);
        setCardStartTime(Date.now()); // Start timing the first card
        // Ensure progress reaches 100% before setting loading to false
        setLoadingProgress(100);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') {
          setError('Request timed out. Please try again with a smaller session length.');
        } else {
          setError(e instanceof Error ? e.message : 'An unknown error occurred');
        }
        setLoadingProgress(0); // Reset on error
      } finally {
        // Introduce a small delay to allow the progress bar to visually reach 100%
        setTimeout(() => {
          setLoading(false);
        }, 300); // 300ms delay
      }
    }
  }, [sectionId, sessionLength, status]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const currentCard = flashcards[currentCardIndex];

  // Preload next card data to improve perceived performance
  useEffect(() => {
    if (flashcards.length > 0 && currentCardIndex < flashcards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      if (preloadedCardIndex !== nextIndex) {
        // Preload next card by accessing its data (triggers any lazy loading)
        const nextCard = flashcards[nextIndex];
        if (nextCard) {
          // Force browser to preload any resources for the next card
          setPreloadedCardIndex(nextIndex);
        }
      }
    }
  }, [currentCardIndex, flashcards, preloadedCardIndex]);

  // Process progress queue with debouncing for better performance
  useEffect(() => {
    if (progressQueue.length === 0) return;

    const processQueue = async () => {
      // Process all queued progress updates
      const queueToProcess = [...progressQueue];
      setProgressQueue([]);

      for (const progressUpdate of queueToProcess) {
        try {
          const response = await fetch("/api/progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(progressUpdate),
          });

          if (!response.ok) {
            console.error("Failed to update progress:", await response.text());
          } else {
            const progressData = await response.json();
            if (progressData.wasLearned) {
              setSessionWordsLearned(prev => prev + 1);
            }
          }
        } catch (e) {
          console.error("Error updating progress:", e);
        }
      }
    };

    // Debounce progress updates to avoid overwhelming the API
    const timeoutId = setTimeout(processQueue, 100);
    return () => clearTimeout(timeoutId);
  }, [progressQueue]);

  // Cleanup: send any remaining progress updates when component unmounts
  useEffect(() => {
    return () => {
      if (progressQueue.length > 0) {
        // Send remaining progress updates immediately on cleanup
        progressQueue.forEach(async (progressUpdate) => {
          try {
            await fetch("/api/progress", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(progressUpdate),
            });
          } catch (e) {
            console.error("Error sending final progress update:", e);
          }
        });
      }
    };
  }, [progressQueue]);

  const handleOptionClick = useCallback((option: string) => {
    if (showFeedback) return; // Prevent multiple selections
    setSelectedOption(option);
    const correct = option === flashcards[currentCardIndex].correctTranslation;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Calculate response time
    const responseTime = Date.now() - cardStartTime;
    const currentWordId = flashcards[currentCardIndex].wordId;

    // Track attempts for this word in this session
    const wordAttempts = (sessionWordAttempts[currentWordId] || 0) + 1;
    setSessionWordAttempts(prev => ({
      ...prev,
      [currentWordId]: wordAttempts
    }));

    // Update session stats immediately for responsive UI
    setSessionStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      totalAnswers: prev.totalAnswers + 1
    }));

    // Queue progress update for batch processing (non-blocking)
    setProgressQueue(prev => [...prev, {
      wordId: flashcards[currentCardIndex].wordId,
      isCorrect: correct,
      responseTime: responseTime,
      sessionWordAttempts: wordAttempts,
      timestamp: Date.now()
    }]);

    // Move to the next card after a shorter delay for better UX
    setTimeout(async () => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setCardStartTime(Date.now()); // Start timing the next card
      } else {
        // End of session - wait for all progress updates to complete before redirecting
        const sessionLength = Math.round((Date.now() - sessionStats.startTime) / 1000 / 60); // minutes
        const finalCorrectAnswers = sessionStats.correctAnswers + (correct ? 1 : 0);
        const finalTotalAnswers = sessionStats.totalAnswers + 1;

        // Wait for any remaining progress updates to complete
        let finalWordsLearned = sessionWordsLearned;

        if (progressQueue.length > 0) {
          // Process remaining queue items synchronously
          for (const progressUpdate of progressQueue) {
            try {
              const response = await fetch("/api/progress", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(progressUpdate),
              });

              if (response.ok) {
                const progressData = await response.json();
                if (progressData.wasLearned) {
                  finalWordsLearned += 1;
                }
              }
            } catch (e) {
              console.error("Error updating final progress:", e);
            }
          }
          // Clear the queue
          setProgressQueue([]);
        }

        const params = new URLSearchParams({
          sectionId: sectionId || '',
          language: language || 'he',
          wordsStudied: finalTotalAnswers.toString(),
          correctAnswers: finalCorrectAnswers.toString(),
          sessionLength: sessionLength.toString(),
          wordsLearnedInSession: finalWordsLearned.toString()
        });

        router.push(`/study/completion?${params.toString()}`);
      }
    }, 1000); // Reduced to 1 second delay for faster card transitions
  }, [showFeedback, flashcards, currentCardIndex, cardStartTime, sessionWordAttempts, sessionStats, sectionId, router, progressQueue, sessionWordsLearned]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showFeedback || !currentCard) return; // Don't allow shortcuts during feedback

      const keyMap: { [key: string]: number } = {
        '1': 0, '2': 1, '3': 2, '4': 3,
        'q': 0, 'w': 1, 'e': 2, 'r': 3
      };

      const optionIndex = keyMap[e.key.toLowerCase()];
      if (optionIndex !== undefined && optionIndex < currentCard.options.length) {
        handleOptionClick(currentCard.options[optionIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCard, showFeedback, handleOptionClick]);


  const progress = flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0;

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <Text size="lg">Preparing your study session...</Text>
        <Text size="sm" c="dimmed">Finding the best words for you to learn</Text>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <Text size="xs" c="dimmed">This may take a few seconds for large sections</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Text size="4rem">😞</Text>
        <Text size="lg" fw={500} c="red">Oops! Something went wrong</Text>
        <Text size="sm" c="dimmed" ta="center">
          {error}
        </Text>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          {sectionId && (
            <button
              onClick={() => router.push(`/study/${sectionId}`)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Setup Session
            </button>
          )}
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Text size="4rem">📚</Text>
        <Text size="lg" fw={500}>No words to study right now</Text>
        <Text size="sm" c="dimmed" ta="center">
          It looks like you&apos;ve already mastered all the words in this section with the selected criteria.
        </Text>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mt-8">
          <LinearProgress value={progress} showPercentage={false} />
        </div>
        <div className="text-center mb-8">
          <p className="text-sm text-text-secondary mb-2">
            Study Session
          </p>
          <p className="text-lg font-medium">
            Card {currentCardIndex + 1} of {flashcards.length}
          </p>
        </div>

        <div className="mb-8">
          <FlashCard
            originalText={currentCard.originalText}
            pronunciation={currentCard.pronunciation}
            level={currentCard.level}
            languageCode={language}
          />
          {showFeedback && (
            <div className={`text-center mt-4 p-3 rounded-lg transition-all duration-300 ${
              isCorrect
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <Text fw={500} size="lg">
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </Text>
              {!isCorrect && (
                <Text size="sm" mt="xs">
                  The correct answer is: <strong>{currentCard.correctTranslation}</strong>
                </Text>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {currentCard.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={showFeedback}
                className={`
                  relative p-4 rounded-lg border-2 text-lg font-medium text-left
                  ${
                    showFeedback && selectedOption === option
                      ? isCorrect
                        ? "bg-green-200 border-green-500"
                        : "bg-red-200 border-red-500"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-blue-300"
                  }
                  ${
                    showFeedback &&
                    option === currentCard.correctTranslation &&
                    selectedOption !== option
                      ? "bg-green-100 border-green-400"
                      : ""
                  }
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                `}
              >
                <div className="flex justify-between items-center">
                  <span>{option}</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
                    {index + 1}
                  </kbd>
                </div>
              </button>
            ))}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-center mb-4">
            <Text size="xs" c="dimmed">
              💡 Use keyboard shortcuts: Press 1-4 or Q-W-E-R to select options
            </Text>
          </div>

      </div>
    );
  }

  return null;
}