'use client';

import { AppShell, Burger, Group, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  // Hide AppShell on specific routes if needed
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    return <>{children}</>;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group justify="space-between" style={{ flex: 1 }}>
            <UnstyledButton component={Link} href="/">
              Ulpan Flashcards
            </UnstyledButton>
            <Group ml="xl" gap={0} visibleFrom="sm">
              <UnstyledButton component={Link} href="/dashboard">Dashboard</UnstyledButton>
              <UnstyledButton component={Link} href="/study">Study</UnstyledButton>
              <UnstyledButton component={Link} href="/profile">Profile</UnstyledButton>
              <UnstyledButton component={Link} href="/upload">Upload</UnstyledButton>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        <UnstyledButton component={Link} href="/dashboard">Dashboard</UnstyledButton>
        <UnstyledButton component={Link} href="/study">Study</UnstyledButton>
        <UnstyledButton component={Link} href="/profile">Profile</UnstyledButton>
        <UnstyledButton component={Link} href="/upload">Upload</UnstyledButton>
      </AppShell.Navbar>
      <AppShell.Main>
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}