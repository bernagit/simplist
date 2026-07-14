'use client'

import { ReactNode } from 'react'
import { Paper, Stack, Text, Title } from '@mantine/core'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Paper withBorder radius="lg" shadow="sm" p="xl" w="100%" maw={520}>
      <Stack gap="xl">
        <Stack gap={4}>
          <Title order={2}>{title}</Title>

          {subtitle && (
            <Text c="dimmed" size="sm">
              {subtitle}
            </Text>
          )}
        </Stack>

        {children}
      </Stack>
    </Paper>
  )
}
