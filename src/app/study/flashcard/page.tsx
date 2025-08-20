"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Flashcard {
  wordId: number;
  hebrewText: string;
  correctTranslation: string;
  options: string[];
}

export default function FlashcardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const sessionLength = searchParams.get("length");
  const focusMode = searchParams.get("focus");
  const studyMode = searchParams.get("mode") || "flashcard"; // Default to flashcard
  const { data: _session, status } = useSession();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchFlashcards = useCallback(async () => {
    if (!sectionId || !sessionLength || !focusMode) {
      setError("Missing study parameters.");
      setLoading(false);
      return;
    }
    if (status === "authenticated") {
      try {
        const response = await fetch(
          `/api/words?sectionId=${sectionId}&length=${sessionLength}&mode=${focusMode}`
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
  }, [sectionId, sessionLength, studyMode, status, focusMode]);

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
          setShowAnswer(false);
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

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showFeedback) return;
    handleOptionClick(typedAnswer);
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
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-2">
              Word {currentCardIndex + 1} of {flashcards.length}
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 rtl-text"
              dir="rtl"
            >
              {currentCard.hebrewText}
            </h2>
            {showAnswer && (
              <p className="text-lg sm:text-xl text-green-600 font-semibold mt-4">
                Correct Answer: {currentCard.correctTranslation}
              </p>
            )}
          </div>

          {studyMode === "typing" ? (
            <form onSubmit={handleTypingSubmit} className="mb-6">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={showFeedback}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg"
                placeholder="Type the English translation..."
              />
              <button
                type="submit"
                disabled={showFeedback || !typedAnswer}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Submit
              </button>
            </form>
          ) : (
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
          )}

          <div className="text-center">
            <button
              onClick={handleRevealAnswer}
              disabled={showFeedback || showAnswer}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Reveal Answer
            </button>
          </div>

          {showFeedback && (
            <div
              className={`mt-6 text-center text-xl font-bold ${
                isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {isCorrect ? "Correct!" : "Incorrect!"}
              {!isCorrect && (
                <p className="text-base text-gray-700 mt-2">
                  The correct answer was: {currentCard.correctTranslation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}