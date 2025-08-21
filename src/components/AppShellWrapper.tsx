'use client';

import { AppShell, Burger, Group, UnstyledButton, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
            <Group ml="xl" gap="md" visibleFrom="sm">
              {session ? (
                <>
                  <UnstyledButton component={Link} href="/dashboard" p="sm" style={{ borderRadius: '4px' }}>
                    📊 Dashboard
                  </UnstyledButton>
                  <UnstyledButton component={Link} href="/sections" p="sm" style={{ borderRadius: '4px' }}>
                    📚 Learn
                  </UnstyledButton>
                  <UnstyledButton component={Link} href="/profile" p="sm" style={{ borderRadius: '4px' }}>
                    👤 Profile
                  </UnstyledButton>
                  <UnstyledButton component={Link} href="/upload" p="sm" style={{ borderRadius: '4px' }}>
                    📤 Upload
                  </UnstyledButton>
                  <UnstyledButton onClick={() => signOut()} p="sm" style={{ borderRadius: '4px' }}>
                    🚪 Logout
                  </UnstyledButton>
                </>
              ) : (
                <Group gap="xs">
                  <Button component={Link} href="/auth/login" variant="outline" size="sm">
                    Login
                  </Button>
                  <Button component={Link} href="/auth/register" size="sm">
                    Register
                  </Button>
                </Group>
              )}
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        {session ? (
          <>
            <UnstyledButton component={Link} href="/dashboard" p="md" style={{ borderRadius: '4px' }}>
              📊 Dashboard
            </UnstyledButton>
            <UnstyledButton component={Link} href="/sections" p="md" style={{ borderRadius: '4px' }}>
              📚 Learn
            </UnstyledButton>
            <UnstyledButton component={Link} href="/profile" p="md" style={{ borderRadius: '4px' }}>
              👤 Profile
            </UnstyledButton>
            <UnstyledButton component={Link} href="/upload" p="md" style={{ borderRadius: '4px' }}>
              📤 Upload
            </UnstyledButton>
            <UnstyledButton onClick={() => signOut()} p="md" style={{ borderRadius: '4px' }}>
              🚪 Logout
            </UnstyledButton>
          </>
        ) : (
          <>
            <UnstyledButton component={Link} href="/auth/login" p="md">Login</UnstyledButton>
            <UnstyledButton component={Link} href="/auth/register" p="md">Register</UnstyledButton>
          </>
        )}
      </AppShell.Navbar>
      <AppShell.Main>
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}