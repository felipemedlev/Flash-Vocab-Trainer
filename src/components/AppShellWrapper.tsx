'use client';

import { AppShell, Group, ActionIcon, Button, Text, Box, Divider, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconMenu2, 
  IconX, 
  IconChartBar, 
  IconBooks, 
  IconUser, 
  IconUpload, 
  IconLogout,
  IconLogin,
  IconUserPlus,
  IconSparkles
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface NavItemProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  variant?: 'default' | 'danger';
}

function NavItem({ href, icon, label, onClick, isActive, variant = 'default' }: NavItemProps) {
  const baseClasses = `
    group relative flex items-center gap-3 px-4 py-3 rounded-xl
    transition-all duration-200 ease-out font-medium text-sm
    hover:scale-[1.02] active:scale-[0.98]
  `;
  
  const variantClasses = {
    default: isActive 
      ? 'bg-gradient-to-r from-accent/20 to-accent/10 text-accent border border-accent/20 shadow-lg shadow-accent/10' 
      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80 hover:shadow-md',
    danger: 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
  };

  const content = (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      {isActive && (
        <div className="absolute right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Hide AppShell on auth routes
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    return <>{children}</>;
  }

  if (!mounted) {
    return <>{children}</>;
  }

  const navItems = session ? [
    { href: '/dashboard', icon: <IconChartBar size={20} />, label: 'Dashboard' },
    { href: '/sections', icon: <IconBooks size={20} />, label: 'Learn Hebrew' },
    { href: '/profile', icon: <IconUser size={20} />, label: 'Profile' },
    { href: '/upload', icon: <IconUpload size={20} />, label: 'Upload Content' },
  ] : [];

  return (
    <AppShell
      header={{ height: { base: 70, sm: 80 } }}
      navbar={{ 
        width: { base: '100%', sm: 320 }, 
        breakpoint: 'sm', 
        collapsed: { desktop: true, mobile: !opened } 
      }}
      padding={0}
    >
      <AppShell.Header className="border-b border-bg-secondary/50 backdrop-blur-xl bg-bg-primary/95 shadow-sm">
        <Group h="100%" px={{ base: 'md', sm: 'xl' }} justify="space-between">
          {/* Mobile Menu Button */}
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={toggle}
            hiddenFrom="sm"
            className="text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-colors duration-200"
          >
            {opened ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </ActionIcon>

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <IconSparkles size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <Text size="xl" fw={700} className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                Ulpan Flashcards
              </Text>
              <Text size="xs" c="dimmed" className="font-hebrew -mt-1">
                לימוד עברית
              </Text>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <Group gap="xs" visibleFrom="sm">
            {session ? (
              <>
                <Group gap="xs">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={pathname === item.href ? 'light' : 'subtle'}
                        leftSection={item.icon}
                        size="sm"
                        className={`
                          transition-all duration-200 hover:scale-105 active:scale-95
                          ${pathname === item.href 
                            ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80'
                          }
                        `}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </Group>
                <Divider orientation="vertical" className="h-6 mx-2" />
                <Button
                  variant="subtle"
                  leftSection={<IconLogout size={16} />}
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Group gap="xs">
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="subtle"
                  leftSection={<IconLogin size={16} />}
                  size="sm"
                  className="text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/auth/register"
                  leftSection={<IconUserPlus size={16} />}
                  size="sm"
                  className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-0"
                >
                  Get Started
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Mobile Navigation Sidebar */}
      <AppShell.Navbar className="bg-bg-primary/98 backdrop-blur-xl border-r border-bg-secondary/50">
        <Box p="lg" className="h-full flex flex-col">
          {/* Mobile Logo */}
          <Link href="/" className="group flex items-center gap-3 mb-8 p-2 -m-2 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <IconSparkles size={24} className="text-white" />
            </div>
            <div>
              <Text size="lg" fw={700} className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                Ulpan Flashcards
              </Text>
              <Text size="xs" c="dimmed" className="font-hebrew -mt-1">
                לימוד עברית
              </Text>
            </div>
          </Link>

          <Stack gap="xs" className="flex-1">
            {session ? (
              <>
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={pathname === item.href}
                  />
                ))}
                <Box mt="auto" pt="lg">
                  <Divider mb="md" />
                  <NavItem
                    icon={<IconLogout size={20} />}
                    label="Logout"
                    onClick={() => signOut({ callbackUrl: '/auth/login' })}
                    variant="danger"
                  />
                </Box>
              </>
            ) : (
              <>
                <NavItem
                  href="/auth/login"
                  icon={<IconLogin size={20} />}
                  label="Login"
                />
                <NavItem
                  href="/auth/register"
                  icon={<IconUserPlus size={20} />}
                  label="Get Started"
                />
              </>
            )}
          </Stack>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main className="bg-bg-secondary/30">
        <div className="min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}