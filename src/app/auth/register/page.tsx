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
  Text,
  Group,
  Divider,
  Loader,
  Progress
} from '@mantine/core';
import {
  IconMail,
  IconLock,
  IconUser,
  IconUserPlus,
  IconLogin,
  IconAlertCircle,
  IconCheck,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react';
import Link from 'next/link';
import { AuthLayout } from '@/components/AuthLayout';

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const getStrengthColor = (strength: number) => {
    if (strength < 25) return 'red';
    if (strength < 50) return 'orange';
    if (strength < 75) return 'yellow';
    return 'green';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully! Signing you in...");
        
        // Automatically sign in the user
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.ok) {
          // Redirect to dashboard after successful sign in
          router.push("/dashboard");
        } else {
          // If auto sign in fails, redirect to login page
          setSuccess("Account created successfully! Please sign in...");
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        }
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Get Started" 
      subtitle="Create your account and begin mastering Hebrew today"
      showBackButton
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* Username Field */}
          <TextInput
            label="Username"
            placeholder="Choose a username"
            size="md"
            leftSection={<IconUser size={18} className="text-text-secondary" />}
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
            required
            classNames={{
              input: 'border-bg-secondary/50 focus:border-accent transition-colors duration-200',
              label: 'font-medium text-text-primary mb-2'
            }}
          />

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

          {/* Password Field with Strength Indicator */}
          <Stack gap="xs">
            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
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
            
            {password && (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Password strength:</Text>
                  <Text size="sm" c={getStrengthColor(passwordStrength)} fw={500}>
                    {getStrengthLabel(passwordStrength)}
                  </Text>
                </Group>
                <Progress
                  value={passwordStrength}
                  color={getStrengthColor(passwordStrength)}
                  size="sm"
                  radius="xl"
                />
              </Stack>
            )}
          </Stack>

          {/* Success Alert */}
          {success && (
            <Alert 
              color="green" 
              variant="light" 
              icon={<IconCheck size={18} />}
              classNames={{
                root: 'border-green-200 bg-green-50/50',
                icon: 'text-green-500',
                message: 'text-green-700'
              }}
            >
              {success}
            </Alert>
          )}

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

          {/* Register Button */}
          <Button
            type="submit"
            size="md"
            fullWidth
            leftSection={loading ? <Loader size={18} color="white" /> : <IconUserPlus size={18} />}
            loading={loading}
            disabled={success !== ""}
            className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: loading || success ? undefined : 'linear-gradient(135deg, #5e72e4 0%, #5a67d8 100%)'
            }}
          >
            {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
          </Button>

          {/* Divider */}
          <Divider 
            label="Already have an account?" 
            labelPosition="center" 
            classNames={{
              label: 'text-text-secondary text-sm'
            }}
          />

          {/* Login Link */}
          <Group justify="center">
            <Button
              component={Link}
              href="/auth/login"
              variant="light"
              size="md"
              fullWidth
              leftSection={<IconLogin size={18} />}
              className="text-accent hover:text-accent/80 bg-accent/5 hover:bg-accent/10 border border-accent/20 hover:border-accent/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In Instead
            </Button>
          </Group>

          {/* Password Requirements */}
          <Stack gap="xs" mt="md">
            <Text size="sm" c="dimmed" fw={500}>Password requirements:</Text>
            <Stack gap="xs">
              <Group gap="xs">
                <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <Text size="xs" c={password.length >= 8 ? 'green' : 'dimmed'}>
                  At least 8 characters
                </Text>
              </Group>
              <Group gap="xs">
                <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                <Text size="xs" c={/[A-Z]/.test(password) ? 'green' : 'dimmed'}>
                  One uppercase letter
                </Text>
              </Group>
              <Group gap="xs">
                <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                <Text size="xs" c={/[0-9]/.test(password) ? 'green' : 'dimmed'}>
                  One number
                </Text>
              </Group>
            </Stack>
          </Stack>
        </Stack>
      </form>
    </AuthLayout>
  );
}