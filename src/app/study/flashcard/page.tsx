import { Suspense } from "react";
import FlashcardContent from "./FlashcardContent";

export default function FlashcardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlashcardContent />
    </Suspense>
  );
}