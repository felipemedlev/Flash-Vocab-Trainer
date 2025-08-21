"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
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

  const handleOptionClick = (option: string) => {
    if (showFeedback) return; // Prevent multiple selections
    setSelectedOption(option);
    const correct = option === flashcards[currentCardIndex].correctTranslation;
    setIsCorrect(correct);
    setShowFeedback(true);

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
          }),
        });

        if (!response.ok) {
          console.error("Failed to update progress:", await response.text());
        }
      } catch (e) {
        console.error("Error updating progress:", e);
      } finally {
        // Move to the next card after a delay, regardless of progress update success
        setTimeout(() => {
          setShowFeedback(false);
          setSelectedOption(null);
          if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
          } else {
            // End of session
            alert("Session Completed!");
            router.push("/dashboard"); // Redirect to dashboard or a session summary page
          }
        }, 1500); // 1.5 second delay for feedback
      }
    };

    updateProgress();
  };


  const currentCard = flashcards[currentCardIndex];
  const progress = flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading study session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        <p>No flashcards to display.</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mt-8">
          <LinearProgress value={progress} />
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {currentCard.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={showFeedback}
                className={`
                  p-4 rounded-lg border-2 text-lg font-medium
                  ${
                    showFeedback && selectedOption === option
                      ? isCorrect
                        ? "bg-green-200 border-green-500"
                        : "bg-red-200 border-red-500"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }
                  ${
                    showFeedback &&
                    option === currentCard.correctTranslation &&
                    selectedOption !== option
                      ? "bg-green-100 border-green-400"
                      : ""
                  }
                  transition-colors duration-200
                `}
              >
                {option}
              </button>
            ))}
          </div>

      </div>
    );
  }

  return null;
}