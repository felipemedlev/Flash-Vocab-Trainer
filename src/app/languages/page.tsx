'use client';

import { Container } from '@mantine/core';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function LanguagesPage() {
  return (
    <Container size="xl" py="xl">
      <LanguageSelector />
    </Container>
  );
}