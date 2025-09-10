'use client';

import { AppShell, Group, ActionIcon, Button, Text, Box, Divider, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconMenu2,
  IconX,
  IconChartBar, IconUser,
  IconLogout,
  IconLogin,
  IconUserPlus,
  IconCards,
  IconWorld
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
      ? 'bg-gradient-to-r from-teal-500/20 to-green-400/10 text-teal-600 border border-teal-500/20 shadow-lg shadow-teal-500/10'
      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 hover:shadow-md',
    danger: 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
  };

  const content = (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      {isActive && (
        <div className="absolute right-2 w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
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
    { href: '/languages', icon: <IconWorld size={20} />, label: 'Languages' },
    { href: '/profile', icon: <IconUser size={20} />, label: 'Profile' },
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
      <AppShell.Header style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Group h="100%" px={{ base: 'md', sm: 'xl' }} justify="space-between">
          {/* Mobile Menu Button */}
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={toggle}
            hiddenFrom="sm"
            style={{ color: '#6B7280' }}
          >
            {opened ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </ActionIcon>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Group gap="sm" style={{ cursor: 'pointer' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)',
                transition: 'all 0.2s ease'
              }}>
                <IconCards size={24} style={{ color: 'white' }} />
              </div>
              <div style={{ display: 'none' }} className="sm:block">
                <Text size="xl" fw={700} style={{
                  background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  VocabBuilder
                </Text>
                <Text size="xs" c="dimmed" style={{ marginTop: '-2px' }}>
                  Complete Vocabulary Platform
                </Text>
              </div>
            </Group>
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
                        style={pathname === item.href ? {
                          background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.05))',
                          color: '#11998e',
                          border: '1px solid rgba(17, 153, 142, 0.2)',
                          boxShadow: '0 2px 8px rgba(17, 153, 142, 0.1)'
                        } : {
                          color: '#6B7280'
                        }}
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
                  style={{
                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Get Started
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Mobile Navigation Sidebar */}
      <AppShell.Navbar style={{ backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(0,0,0,0.08)' }}>
        <Box p="lg" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Mobile Logo */}
          <Link href="/" style={{ textDecoration: 'none', marginBottom: '32px' }}>
            <Group gap="sm">
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(17, 153, 142, 0.3)'
              }}>
                <IconCards size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <Text size="lg" fw={700} style={{
                  background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  VocabBuilder
                </Text>
                <Text size="xs" c="dimmed" style={{ marginTop: '-2px' }}>
                  Complete Vocabulary Platform
                </Text>
              </div>
            </Group>
          </Link>

          <Stack gap="xs" style={{ flex: 1 }}>
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

      <AppShell.Main style={{ backgroundColor: '#f8fafc' }}>
        <div className="min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}