'use client';

import { Container, Paper, Text, Group, Stack, Anchor, Button } from '@mantine/core';
import { IconCards, IconLogin, IconUserPlus } from '@tabler/icons-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-bg-primary to-accent/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(94,114,228,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)]" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/5 rounded-full blur-lg animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-accent/5 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header
          className="h-20 flex items-center"
          style={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Container size="xl" className="w-full">
            <Group justify="space-between" align="center">
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
                </Group>
              </Link>

              {/* Action Buttons */}
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
            </Group>
          </Container>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Container size="sm" className="w-full max-w-md">
            <Stack gap="xl" align="center">
              {/* Welcome Section */}
              <Stack gap="sm" align="center" className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl mb-2">
                  <IconCards size={32} className="text-accent" />
                </div>

                <Text size="2rem" fw={700} className="bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                  {title}
                </Text>
                <Text size="lg" c="dimmed" className="max-w-sm">
                  {subtitle}
                </Text>
              </Stack>

              {/* Auth Form */}
              <Paper
                shadow="xl"
                radius="xl"
                p="xl"
                className="w-full bg-bg-card/80 backdrop-blur-xl border border-bg-secondary/50"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {children}
              </Paper>

              {/* Footer */}
              <Text size="sm" c="dimmed" className="text-center max-w-sm">
                By continuing, you agree to our{' '}
                <Anchor href="#" size="sm" className="text-accent hover:text-accent/80">
                  Terms of Service
                </Anchor>{' '}
                and{' '}
                <Anchor href="#" size="sm" className="text-accent hover:text-accent/80">
                  Privacy Policy
                </Anchor>
              </Text>
            </Stack>
          </Container>
        </div>

        {/* Bottom Decoration */}
        <div className="flex-shrink-0 h-2 bg-gradient-to-r from-accent via-purple-500 to-blue-500" />
      </div>
    </div>
  );
}
