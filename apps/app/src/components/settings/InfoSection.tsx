'use client'

import { useChangelog } from '@/hooks/useChangelog'
import { ChangelogView } from '../common/ChangelogView'
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

export function InfoSection() {
  const { currentVersion, rawChangelog } = useChangelog()
  const environment = process.env.NODE_ENV || 'development'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'Local / Proxied'

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
                Self-hosted task & list management engine
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
            href="https://github.com/your-repo/simplist"
            target="_blank"
            underline="hover"
          >
            <Badge
              variant="default"
              size="sm"
              leftSection={<IconBrandGithub size={12} />}
              rightSection={<IconExternalLink size={10} />}
            >
              GitHub
            </Badge>
          </Anchor>
          <Anchor href="/docs" target="_blank" underline="hover">
            <Badge
              variant="default"
              size="sm"
              leftSection={<IconBook size={12} />}
              rightSection={<IconExternalLink size={10} />}
            >
              Documentation
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
                Environment
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
                API Endpoint
              </Text>
              <Text size="xs" fw={600} truncate mt={2}>
                {apiUrl}
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {/* 3. Collapsible / Accordion Release Notes */}
      <Card withBorder padding="0" radius="md">
        <Accordion variant="separated" defaultValue="changelog">
          <Accordion.Item value="changelog" style={{ border: 'none' }}>
            <Accordion.Control>
              <Group justify="space-between">
                <Text fw={600} size="sm">
                  Release History & Changelog
                </Text>
                <Text size="xs" c="dimmed">
                  Latest: v{currentVersion}
                </Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {rawChangelog ? (
                <ChangelogView rawMarkdown={rawChangelog} />
              ) : (
                <Text size="sm" c="dimmed">
                  No changelog entry found.
                </Text>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </Stack>
  )
}