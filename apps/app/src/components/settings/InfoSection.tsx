'use client'

import { useChangelog } from '@/hooks/useChangelog'
import { ReleaseNotes } from '../common/ReleaseNotes'
import { DOCS_URL } from '@/utils/constants'
import {
  Stack,
  Text,
  Badge,
  Group,
  Card,
  SimpleGrid,
  Accordion,
  Anchor,
  ThemeIcon,
} from '@mantine/core'
import {
  IconInfoCircle,
  IconGitBranch,
  IconServer,
  IconBook,
  IconBrandGithub,
  IconExternalLink,
} from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import api from '@/utils/ky'

type Health = { status: string; version?: string }

/**
 * The browser always reaches the API on this same origin under /api: nginx forwards it in
 * production, a Next.js rewrite in development. So the public URL is derived from the page,
 * and the internal upstream (simplist-api:2000) is never exposed, nor needed.
 */
function useApiInfo() {
  const url = typeof window === 'undefined' ? '/api' : `${window.location.origin}/api`
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => api.get('health', { retry: 0, timeout: 5000 }).json<Health>(),
    staleTime: 30_000
  })
  return { url, health }
}

export function InfoSection() {
  const t = useTranslations('InfoSection')
  const { currentVersion, releases } = useChangelog()
  const environment = process.env.NODE_ENV || 'development'
  const { url: apiUrl, health } = useApiInfo()
  const apiVersion = health.data?.version
  const versionMismatch = !!apiVersion && apiVersion !== currentVersion

  return (
    <Stack gap="lg">
      <Card withBorder padding="md" radius="md" bg="var(--mantine-color-body)">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <ThemeIcon variant="light" size="xl" radius="md" color="blue">
              <IconInfoCircle size={24} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="lg">
                Simplist
              </Text>
              <Text size="xs" c="dimmed">
                {t('subtitle')}
              </Text>
            </div>
          </Group>
          <Badge color="blue" variant="filled" size="lg" radius="sm">
            v{currentVersion}
          </Badge>
        </Group>

        {/* Quick Links */}
        <Group gap="xs" mt="md">
          <Anchor
            href="https://github.com/bernagit/simplist"
            target="_blank"
            underline="hover"
          >
            <Badge
              variant="default"
              size="sm"
              leftSection={<IconBrandGithub size={12} />}
              rightSection={<IconExternalLink size={10} />}
            >
              {t('links.github')}
            </Badge>
          </Anchor>
          <Anchor href={DOCS_URL} target="_blank" underline="hover">
            <Badge
              variant="default"
              size="sm"
              leftSection={<IconBook size={12} />}
              rightSection={<IconExternalLink size={10} />}
            >
              {t('links.documentation')}
            </Badge>
          </Anchor>
        </Group>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <Card withBorder padding="xs" radius="sm">
          <Group gap="xs">
            <IconGitBranch size={16} color="var(--mantine-color-dimmed)" />
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                {t('environment.label')}
              </Text>

              <Group gap={6} mt={2}>
                <Badge
                  size="xs"
                  color={environment === 'production' ? 'green' : 'amber'}
                  variant="dot"
                >
                  {environment}
                </Badge>
              </Group>
            </div>
          </Group>
        </Card>

        <Card withBorder padding="xs" radius="sm">
          <Group gap="xs">
            <IconServer size={16} color="var(--mantine-color-dimmed)" />
            <div style={{ overflow: 'hidden' }}>
              <Text size="xs" c="dimmed" fw={500}>
                {t('apiEndpoint.label')}
              </Text>
              <Text size="xs" fw={600} truncate mt={2} title={apiUrl}>
                {apiUrl}
              </Text>
              <Group gap={6} mt={4}>
                <Badge
                  size="xs"
                  variant="dot"
                  color={health.isPending ? 'gray' : health.isSuccess ? 'green' : 'red'}
                >
                  {health.isPending
                    ? '…'
                    : health.isSuccess
                      ? t('apiEndpoint.online')
                      : t('apiEndpoint.offline')}
                </Badge>
                {apiVersion && (
                  <Badge size="xs" variant="light" color={versionMismatch ? 'orange' : 'gray'}>
                    {t('apiEndpoint.version', { version: apiVersion })}
                  </Badge>
                )}
              </Group>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {versionMismatch && (
        <Text size="xs" c="orange">
          {t('apiEndpoint.mismatch', { api: apiVersion, app: currentVersion })}
        </Text>
      )}

      {/* Release Notes */}
      <Card withBorder padding="0" radius="md">
        <Accordion variant="separated" defaultValue="changelog">
          <Accordion.Item value="changelog" style={{ border: 'none' }}>
            <Accordion.Control>
              <Group justify="space-between">
                <Text fw={600} size="sm">
                  {t('changelog.title')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('changelog.latest', { version: currentVersion })}
                </Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <ReleaseNotes releases={releases} />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </Stack>
  )
}