import { Suspense } from 'react';
import StudyContent from './StudyContent';

export default function StudySetupPage() {
  return (
    <Suspense fallback={<div>Loading study setup...</div>}>
      <StudyContent />
    </Suspense>
  );
}