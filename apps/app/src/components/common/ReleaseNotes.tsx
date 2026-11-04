'use client'

import { Anchor, Badge, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconBug, IconExternalLink, IconSparkles, IconTrendingUp } from '@tabler/icons-react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { Release, ReleaseNoteType } from '@/models/releaseNotes'
import { DOCS_URL } from '@/utils/constants'

const NOTE_STYLE: Record<ReleaseNoteType, { color: string; icon: typeof IconSparkles }> = {
  new: { color: 'blue', icon: IconSparkles },
  improved: { color: 'teal', icon: IconTrendingUp },
  fixed: { color: 'gray', icon: IconBug }
}

/** Full changelog in the docs, in the user's language when there is one */
export function useFullChangelogUrl() {
  const locale = useLocale()
  return `${DOCS_URL}${locale === 'en' ? '/en' : ''}/changelog/`
}

/** The short, user-facing notes of one or more releases (release-notes.json). */
export function ReleaseNotes({
  releases,
  withVersionTitles = true
}: {
  releases: Release[]
  withVersionTitles?: boolean
}) {
  const t = useTranslations('Changelog')
  const locale = useLocale()
  const format = useFormatter()
  const fullChangelogUrl = useFullChangelogUrl()

  return (
    <Stack gap="lg">
      {releases.length === 0 && (
        <Text size="sm" c="dimmed">
          {t('empty')}
        </Text>
      )}

      {releases.map(release => (
        <Stack key={release.version} gap="sm">
          {withVersionTitles && (
            <Group gap="xs" align="baseline">
              <Title order={5}>v{release.version}</Title>
              <Text size="xs" c="dimmed">
                {format.dateTime(new Date(release.date), { dateStyle: 'medium' })}
              </Text>
            </Group>
          )}
          {release.notes.map((note, index) => {
            const { color, icon: Icon } = NOTE_STYLE[note.type]
            return (
              <Group key={index} gap="sm" wrap="nowrap" align="flex-start">
                <ThemeIcon size={28} radius="md" variant="light" color={color} style={{ flexShrink: 0 }}>
                  <Icon size={16} />
                </ThemeIcon>
                <div style={{ minWidth: 0 }}>
                  <Badge size="xs" variant="transparent" color={color} px={0}>
                    {t(`types.${note.type}`)}
                  </Badge>
                  <Text size="sm">{locale === 'it' ? note.it : note.en}</Text>
                </div>
              </Group>
            )
          })}
        </Stack>
      ))}

      <Anchor href={fullChangelogUrl} target="_blank" size="xs" c="dimmed">
        <Group gap={4} component="span" wrap="nowrap">
          {t('fullChangelog')}
          <IconExternalLink size={12} />
        </Group>
      </Anchor>
    </Stack>
  )
}
