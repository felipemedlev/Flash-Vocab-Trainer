'use client';

import { Paper, Text, UnstyledButton, Group } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import classes from './MenuCard.module.css';

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export function MenuCard({ icon, title, description, href }: MenuCardProps) {
  return (
    <UnstyledButton component={Link} href={href} className={classes.card}>
      <Paper withBorder p="md" radius="md" className={classes.paper}>
        <Group>
          <div className={classes.iconWrapper}>{icon}</div>
          <div style={{ flex: 1 }}>
            <Text size="lg" fw={600} className={classes.title}>
              {title}
            </Text>
            <Text size="sm" c="dimmed" className={classes.description}>
              {description}
            </Text>
          </div>
          <IconChevronRight size={24} className={classes.chevron} />
        </Group>
      </Paper>
    </UnstyledButton>
  );
}