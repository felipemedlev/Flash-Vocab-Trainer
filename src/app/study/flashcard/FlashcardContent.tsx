"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Text } from "@mantine/core";
import { FlashCard } from "@/components/FlashCard";
import { LinearProgress } from "@/components/LinearProgress";

interface Flashcard {
  wordId: number;
  hebrewText: string;
  correctTranslation: string;
  options: string[];
  level: 'new' | 'learning' | 'review' | 'mastered';
}

export default function FlashcardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const sessionLength = searchParams.get("length");
  const studyMode = searchParams.get("mode"); // Changed from focusMode to studyMode
  const { status } = useSession();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
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
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [sessionWordAttempts, setSessionWordAttempts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchFlashcards = useCallback(async () => {
    if (!sectionId || !sessionLength || !studyMode) { // Changed focusMode to studyMode
      setError("Missing study parameters.");
      setLoading(false);
      return;
    }
    if (status === "authenticated") {
      try {
        const response = await fetch(
          `/api/words?sectionId=${sectionId}&length=${sessionLength}&mode=${studyMode}` // Changed focusMode to studyMode
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Flashcard[] = await response.json();
        if (data.length === 0) {
          setError("No words to study in this section with the selected criteria.");
        }
        setFlashcards(data);
        setCardStartTime(Date.now()); // Start timing the first card
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
  }, [sectionId, sessionLength, status, studyMode]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const currentCard = flashcards[currentCardIndex];

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
  }, [currentCard, showFeedback]);

  const handleOptionClick = (option: string) => {
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

    // Update user progress via API
    const updateProgress = async () => {
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wordId: flashcards[currentCardIndex].wordId,
            isCorrect: correct,
            responseTime: responseTime,
            sessionWordAttempts: wordAttempts,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update progress:", await response.text());
        } else {
          // Check if word was learned in this session
          const progressData = await response.json();
          if (progressData.wasLearned) {
            setSessionStats(prev => ({
              ...prev,
              wordsLearnedInSession: prev.wordsLearnedInSession + 1
            }));
          }
        }
        
        // Update session stats
        setSessionStats(prev => ({
          ...prev,
          correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
          totalAnswers: prev.totalAnswers + 1
        }));
      } catch (e) {
        console.error("Error updating progress:", e);
      } finally {
        // Move to the next card after a delay, regardless of progress update success
        setTimeout(() => {
          setShowFeedback(false);
          setSelectedOption(null);
          if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setCardStartTime(Date.now()); // Start timing the next card
          } else {
            // End of session - redirect to completion page with stats
            const sessionLength = Math.round((Date.now() - sessionStats.startTime) / 1000 / 60); // minutes
            const finalCorrectAnswers = sessionStats.correctAnswers + (correct ? 1 : 0);
            const finalTotalAnswers = sessionStats.totalAnswers + 1;
            const finalWordsLearned = sessionStats.wordsLearnedInSession;
            
            const params = new URLSearchParams({
              sectionId: sectionId || '',
              wordsStudied: finalTotalAnswers.toString(),
              correctAnswers: finalCorrectAnswers.toString(),
              sessionLength: sessionLength.toString(),
              wordsLearnedInSession: finalWordsLearned.toString()
            });
            
            router.push(`/study/completion?${params.toString()}`);
          }
        }, 1500); // 1.5 second delay for feedback
      }
    };

    updateProgress();
  };


  const progress = flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0;

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <Text size="lg">Preparing your study session...</Text>
        <Text size="sm" c="dimmed">Finding the best words for you to learn</Text>
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
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
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
            hebrew={currentCard.hebrewText}
            level={currentCard.level}
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