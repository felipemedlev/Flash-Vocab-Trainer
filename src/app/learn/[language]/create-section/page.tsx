'use client';

import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Title,
  Text,
  Group,
  ActionIcon
} from '@mantine/core';
import {
  IconArrowLeft
} from '@tabler/icons-react';
import { getLanguageConfig, isValidLanguageCode } from '@/config/languages';
import { LanguageDisplay } from '@/components/LanguageText';
import SectionInput from '@/components/SectionInput';

export default function CreateSectionPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const language = params.language as string;

  const languageConfig = getLanguageConfig(language);

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  if (!isValidLanguageCode(language) || !languageConfig) {
    router.push('/');
    return null;
  }

  const handleSectionSaved = () => {
    // Redirect to the sections page after successful creation
    router.push(`/learn/${language}/sections`);
  };

  return (
    <Container size="md" py="xl">
      {/* Header */}
      <Group gap="md" align="center" mb="xl">
        <ActionIcon
          variant="light"
          size="lg"
          onClick={() => router.push(`/learn/${language}/sections`)}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <div>
          <Group gap="sm" align="center">
            <Title order={1}>Create New Section</Title>
            <LanguageDisplay language={language} showFlag={true} />
          </Group>
          <Text c="dimmed">
            Create a new custom {languageConfig.name} vocabulary section
          </Text>
        </div>
      </Group>

      {/* Section Input Component */}
      <SectionInput
        language={language}
        onSectionSaved={handleSectionSaved}
      />
    </Container>
  );
}