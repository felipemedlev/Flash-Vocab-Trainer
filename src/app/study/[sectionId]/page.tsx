"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Container,
  Title,
  Text,
  Tabs,
  Paper,
  Loader,
  Center,
  Alert
} from '@mantine/core';
import { IconPlayerPlay, IconPlus, IconEdit, IconInfoCircle } from '@tabler/icons-react';
import StudySessionSetup from '@/components/StudySessionSetup';
import WordInput from '@/components/WordInput';
import WordManagement from '@/components/WordManagement';

interface Section {
  id: number;
  name: string;
  description: string | null;
}

export default function StudySetupPage() {
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('study');
  const params = useParams();
  const router = useRouter();
  const sectionId = params.sectionId;
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (!sectionId) {
      router.replace("/sections");
      return;
    }
    async function fetchSection() {
      if (status === 'authenticated') {
        try {
          const response = await fetch(`/api/sections/${sectionId}`);
          if (response.ok) {
            const data = await response.json();
            setSection(data);
          }
        } catch (error) {
          console.error("Failed to fetch section:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchSection();
  }, [sectionId, router, status]);

  if (status === 'loading' || loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  if (!section) {
    return (
      <Center h="100vh">
        <Alert icon={<IconInfoCircle size={16} />} color="red">
          Section not found.
        </Alert>
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="xs">
          {section.name}
        </Title>
        {section.description && (
          <Text c="dimmed" ta="center" mb="xl">
            {section.description}
          </Text>
        )}
        
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="study" leftSection={<IconPlayerPlay size={16} />}>
              Study Session
            </Tabs.Tab>
            <Tabs.Tab value="add" leftSection={<IconPlus size={16} />}>
              Add Words
            </Tabs.Tab>
            <Tabs.Tab value="manage" leftSection={<IconEdit size={16} />}>
              Manage Words
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="study" pt="md">
            <StudySessionSetup sectionId={sectionId as string} />
          </Tabs.Panel>

          <Tabs.Panel value="add" pt="md">
            <WordInput 
              sectionId={sectionId as string} 
              onWordsSaved={() => {
                // Optionally refresh data or show success message
              }} 
            />
          </Tabs.Panel>

          <Tabs.Panel value="manage" pt="md">
            <WordManagement 
              sectionId={sectionId as string}
              onWordsChange={() => {
                // Optionally refresh data
              }}
            />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}