'use client'

import {
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title
} from '@mantine/core'
import { IconArrowRight, IconList, IconPlus, IconUsers } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createListModal } from '@/lib/modals/list'
import { useLists } from '@/queries/lists'
import { useMemo } from 'react'

export default function Homepage() {
  const router = useRouter()
  const t = useTranslations('HomePage')

  const { data, isLoading } = useLists()
  const hasLists = useMemo(() => !!data?.data?.owned?.length, [data])

  if (isLoading || !data) {
    return (
      <Container size="md" py={100}>
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    )
  }

  return (
    <Container size="md" py={40}>
      <Stack gap={40}>
        <Stack gap={4}>
          <Title order={1}>{t('welcomeTitle')}</Title>

          <Text c="dimmed">{t('welcomeSubtitle')}</Text>
        </Stack>

        <Button
          size="md"
          leftSection={<IconPlus size={18} />}
          w="fit-content"
          onClick={createListModal}
        >
          {hasLists ? t('createListButton') : t('createFirstListButton')}
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
              {t('myListsTitle')}
            </Title>

            <Text c="dimmed" size="sm">
              {t('myListsDesc')}
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
              {t('sharedListsTitle')}
            </Title>

            <Text c="dimmed" size="sm">
              {t('sharedListsDesc')}
            </Text>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  )
}