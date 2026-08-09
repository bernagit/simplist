'use client'

import { useMemo } from 'react'
import { Stack, Title, Badge, List, Text, Timeline, Paper } from '@mantine/core'
import { parseChangelog, getSectionBadgeColor } from '@/utils/parseChangelog'
import { useTranslations } from 'next-intl'

interface ChangelogViewProps {
  rawMarkdown: string
}

export function ChangelogView({ rawMarkdown }: ChangelogViewProps) {
  const t = useTranslations('Changelog')

  const entries = useMemo(() => parseChangelog(rawMarkdown), [rawMarkdown])

  if (entries.length === 0) {
    return <Text c="dimmed">{t('empty')}</Text>
  }

  return (
    <Timeline active={0} bulletSize={14}>
      {entries.map(entry => (
        <Timeline.Item
          key={entry.version}
          title={
            <Title order={4} mb="xs">
              {entry.version.startsWith('v') ? entry.version : `v${entry.version}`}
            </Title>
          }
        >
          <Stack gap="md" mt="xs">
            {entry.sections.map((section, idx) => {
              const localizedSectionType = t.has(`sections.${section.type}`)
                ? t(`sections.${section.type}`)
                : section.type

              return (
                <Paper key={idx} withBorder p="xs" radius="sm">
                  <Badge color={getSectionBadgeColor(section.type)} variant="light" mb="xs">
                    {localizedSectionType}
                  </Badge>

                  <List size="sm" spacing={4}>
                    {section.items.map((item, itemIdx) => (
                      <List.Item key={itemIdx}>
                        <Text size="sm" component="span">
                          {item}
                        </Text>
                      </List.Item>
                    ))}
                  </List>
                </Paper>
              )
            })}
          </Stack>
        </Timeline.Item>
      ))}
    </Timeline>
  )
}