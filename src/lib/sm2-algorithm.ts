/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on the SuperMemo SM-2 algorithm by Piotr Wozniak
 *
 * Quality ratings:
 * 5 - perfect response
 * 4 - correct response after a hesitation
 * 3 - correct response recalled with serious difficulty
 * 2 - incorrect response; where the correct one seemed easy to recall
 * 1 - incorrect response; the correct one remembered
 * 0 - complete blackout
 */

export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetition: number;
  nextReviewDate: Date;
  quality: number;
  isLearned: boolean;
}

export interface SM2Input {
  quality: number; // 0-5 quality rating
  easinessFactor: number; // Current easiness factor
  interval: number; // Current interval in days
  repetition: number; // Current repetition count
}

/**
 * Calculate next review parameters using SM-2 algorithm
 */
export function calculateSM2(input: SM2Input): SM2Result {
  let { quality, easinessFactor, interval, repetition } = input;

  // Ensure quality is within valid range
  quality = Math.max(0, Math.min(5, quality));

  // If quality is less than 3, reset repetition and interval
  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    // Increment repetition for successful recall
    repetition += 1;

    // Calculate new interval based on repetition
    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
      // Cap the interval to prevent extremely large values
      interval = Math.min(interval, 365); // Max 1 year
    }
  }

  // Update easiness factor based on quality
  const oldEF = easinessFactor;
  easinessFactor = oldEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure easiness factor stays within bounds
  easinessFactor = Math.max(1.3, Math.min(2.5, easinessFactor));

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  // Ensure the date is valid and not too far in the future
  if (isNaN(nextReviewDate.getTime()) || nextReviewDate.getTime() > Date.now() + (365 * 1 * 24 * 60 * 60 * 1000)) {
    // If date is invalid or too far in future, set to 1 year from now
    nextReviewDate.setTime(Date.now() + (365 * 24 * 60 * 60 * 1000));
  }

  // Determine if word is considered "learned"
  // A word is learned after 3 successful reviews (quality >= 3) with increasing intervals
  // This provides more reliable learning while still using spaced repetition
  const isLearned = repetition >= 3 && quality >= 3;



  return {
    easinessFactor,
    interval,
    repetition,
    nextReviewDate,
    quality,
    isLearned
  };
}

/**
 * Convert user performance to SM-2 quality rating
 * This maps user interaction to the 0-5 quality scale
 */
export function mapPerformanceToQuality(
  isCorrect: boolean,
  responseTime?: number, // in milliseconds
  previousAttempts?: number // number of attempts for this word in session
): number {
  if (!isCorrect) {
    // Incorrect responses map to 0-2 based on context
    if (previousAttempts && previousAttempts > 1) {
      return 0; // Complete blackout after multiple attempts
    }
    return 1; // Incorrect but some recognition
  }

  // Correct responses map to 3-5 based on response time and confidence
  if (responseTime) {
    if (responseTime < 3000) { // Fast (< 3 seconds) - more generous
      return 5; // Perfect response
    } else if (responseTime < 8000) { // Moderate (< 8 seconds) - more generous
      return 4; // Good response with slight hesitation
    } else {
      return 3; // Correct but with difficulty
    }
  }

  // Default for correct responses without timing data - more generous
  return isCorrect ? 5 : 1;
}

/**
 * Determine if a word should be shown based on its next review date
 */
export function shouldReviewWord(nextReviewDate: Date): boolean {
  return new Date() >= nextReviewDate;
}

/**
 * Get words that are due for review
 */
export function getWordsForReview(
  words: Array<{
    id: number;
    nextReviewDate: Date;
    repetition: number;
    easinessFactor: number;
    interval: number;
  }>,
  maxWords: number = 20
): Array<{ id: number; priority: number }> {
  const now = new Date();

  // Filter words that are due for review
  const dueWords = words.filter(word => shouldReviewWord(word.nextReviewDate));

  // Calculate priority for each word (higher = more urgent)
  const wordsWithPriority = dueWords.map(word => {
    const daysPastDue = Math.max(0,
      (now.getTime() - word.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Priority factors:
    // - Days past due (higher = more urgent)
    // - Lower easiness factor (harder words get priority)
    // - Lower repetition count (newer words get priority)
    const priority =
      daysPastDue * 10 +
      (2.5 - word.easinessFactor) * 5 +
      (5 - Math.min(5, word.repetition)) * 2;

    return {
      id: word.id,
      priority
    };
  });

  // Sort by priority (descending) and return top N
  return wordsWithPriority
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxWords);
}

