'use client';

import { Title, Text, Button, Container, Group } from '@mantine/core';
import Link from 'next/link';

export default function Home() {
  return (
    <Container size="md">
      <div style={{ textAlign: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
        <Title order={1} style={{ marginBottom: '20px' }}>
          Welcome to Ulpan Flashcards
        </Title>
        <Text size="lg" style={{ marginBottom: '40px' }}>
          The best way to learn Hebrew vocabulary.
        </Text>
        <Group style={{ justifyContent: 'center' }}>
          <Button component={Link} href="/study" size="lg">
            Start Studying
          </Button>
          <Button component={Link} href="/dashboard" variant="outline" size="lg">
            View Dashboard
          </Button>
          <Button component={Link} href="/upload" variant="outline" size="lg">
            Upload Section
          </Button>
        </Group>
      </div>
    </Container>
  );
}
