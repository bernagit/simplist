import { useMemo } from 'react';
import { Stack, Title, Badge, List, Text, Timeline, Paper } from '@mantine/core';
import { parseChangelog, getSectionBadgeColor } from '@/utils/parseChangelog';

interface ChangelogViewProps {
  rawMarkdown: string;
}

export function ChangelogView({ rawMarkdown }: ChangelogViewProps) {
  const entries = useMemo(() => parseChangelog(rawMarkdown), [rawMarkdown]);

  if (entries.length === 0) {
    return <Text color="dimmed">No release notes found.</Text>;
  }

  return (
    <Timeline active={0} bulletSize={14}>
      {entries.map((entry) => (
        <Timeline.Item key={entry.version} title={
          <Title order={4} mb="xs">
            {entry.version.startsWith('v') ? entry.version : `v${entry.version}`}
          </Title>
        }>
          <Stack gap="md" mt="xs">
            {entry.sections.map((section, idx) => (
              <Paper key={idx} withBorder p="xs" radius="sm">
                <Badge 
                  color={getSectionBadgeColor(section.type)} 
                  variant="light" 
                  mb="xs"
                >
                  {section.type}
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
            ))}
          </Stack>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}