'use client'

import {
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title
} from '@mantine/core'
import { IconArrowRight, IconList, IconPlus, IconUsers } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { createListModal } from '@/lib/modals/list'

export default function Homepage() {
  const router = useRouter()

  return (
    <Container size="md" py={40}>
      <Stack gap={40}>
        <Stack gap={4}>
          <Title order={1}>Welcome to Simplist 👋</Title>

          <Text c="dimmed">Keep your lists together</Text>
        </Stack>

        <Button
          size="md"
          leftSection={<IconPlus size={18} />}
          w="fit-content"
          onClick={createListModal}
        >
          Create your first list
        </Button>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Card
            withBorder
            radius="md"
            p="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/lists')}
          >
            <Group justify="space-between">
              <ThemeIcon size="xl" variant="light">
                <IconList size={22} />
              </ThemeIcon>

              <IconArrowRight size={18} />
            </Group>

            <Title order={4} mt="md">
              My Lists
            </Title>

            <Text c="dimmed" size="sm">
              Browse and manage all your personal lists.
            </Text>
          </Card>

          <Card
            withBorder
            radius="md"
            p="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/lists/shared')}
          >
            <Group justify="space-between">
              <ThemeIcon size="xl" variant="light" color="teal">
                <IconUsers size={22} />
              </ThemeIcon>

              <IconArrowRight size={18} />
            </Group>

            <Title order={4} mt="md">
              Shared Lists
            </Title>

            <Text c="dimmed" size="sm">
              Lists that other people shared with you.
            </Text>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
