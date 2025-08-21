"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Anchor, Group,
  Divider,
  Loader
} from '@mantine/core';
import {
  IconMail,
  IconLock,
  IconLogin,
  IconUserPlus,
  IconAlertCircle,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react';
import Link from 'next/link';
import { AuthLayout } from '@/components/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your Hebrew learning journey"
      showBackButton
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* Email Field */}
          <TextInput
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            size="md"
            leftSection={<IconMail size={18} className="text-text-secondary" />}
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            classNames={{
              input: 'border-bg-secondary/50 focus:border-accent transition-colors duration-200',
              label: 'font-medium text-text-primary mb-2'
            }}
          />

          {/* Password Field */}
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            size="md"
            leftSection={<IconLock size={18} className="text-text-secondary" />}
            visibilityToggleIcon={({ reveal }) => 
              reveal ? <IconEyeOff size={18} /> : <IconEye size={18} />
            }
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            classNames={{
              input: 'border-bg-secondary/50 focus:border-accent transition-colors duration-200',
              label: 'font-medium text-text-primary mb-2'
            }}
          />

          {/* Error Alert */}
          {error && (
            <Alert 
              color="red" 
              variant="light" 
              icon={<IconAlertCircle size={18} />}
              classNames={{
                root: 'border-red-200 bg-red-50/50',
                icon: 'text-red-500',
                message: 'text-red-700'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            size="md"
            fullWidth
            leftSection={loading ? <Loader size={18} color="white" /> : <IconLogin size={18} />}
            loading={loading}
            className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: loading ? undefined : 'linear-gradient(135deg, #5e72e4 0%, #5a67d8 100%)'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Divider */}
          <Divider 
            label="Don't have an account?" 
            labelPosition="center" 
            classNames={{
              label: 'text-text-secondary text-sm'
            }}
          />

          {/* Register Link */}
          <Group justify="center">
            <Button
              component={Link}
              href="/auth/register"
              variant="light"
              size="md"
              fullWidth
              leftSection={<IconUserPlus size={18} />}
              className="text-accent hover:text-accent/80 bg-accent/5 hover:bg-accent/10 border border-accent/20 hover:border-accent/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Create New Account
            </Button>
          </Group>

          {/* Additional Links */}
          <Group justify="center" mt="md">
            <Anchor
              href="#"
              size="sm"
              className="text-text-secondary hover:text-accent transition-colors duration-200"
            >
              Forgot your password?
            </Anchor>
          </Group>
        </Stack>
      </form>
    </AuthLayout>
  );
}