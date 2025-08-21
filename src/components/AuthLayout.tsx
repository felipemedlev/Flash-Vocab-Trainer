'use client';

import { Container, Paper, Text, Group, Stack, Anchor } from '@mantine/core';
import { IconSparkles, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackButton?: boolean;
}

export function AuthLayout({ children, title, subtitle, showBackButton = false }: AuthLayoutProps) {
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
        <div className="flex-shrink-0 p-6 lg:p-8">
          <Group justify="space-between" align="center">
            {showBackButton && (
              <Anchor
                component={Link}
                href="/"
                className="group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                <IconArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                <Text size="sm" fw={500}>Back to Home</Text>
              </Anchor>
            )}
            
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200 ml-auto">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                <IconSparkles size={24} className="text-white" />
              </div>
              <div>
                <Text size="xl" fw={700} className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                  Ulpan Flashcards
                </Text>
                <Text size="xs" c="dimmed" className="font-hebrew -mt-1">
                  לימוד עברית
                </Text>
              </div>
            </Link>
          </Group>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Container size="sm" className="w-full max-w-md">
            <Stack gap="xl" align="center">
              {/* Welcome Section */}
              <Stack gap="sm" align="center" className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl mb-2">
                  <IconSparkles size={32} className="text-accent" />
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
