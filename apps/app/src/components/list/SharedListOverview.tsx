'use client'

import { List, SharedList } from '@/models/lists'
import { useLists } from '@/queries/lists'
import { contextMenuStyles } from '@/utils/misc'
import {
  Center,
  Loader,
  Container,
  Group,
  Title,
  Grid,
  Card,
  Stack,
  ThemeIcon,
  Badge,
  Text,
  TextInput
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
  IconUsers,
  IconInfoCircle
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useContextMenu } from 'mantine-contextmenu'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function SharedListOverview() {
  const t = useTranslations('SharedListOverview')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300)
  const { showContextMenu } = useContextMenu()

  const { data: lists, isLoading } = useLists()
  const data = useMemo(() => lists?.data.shared ?? [], [lists])

  const filteredData = useMemo(() => {
    let lists = [...data]

    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase()

      lists = lists.filter(
        list =>
          list.title.toLowerCase().includes(query) ||
          list.description?.toLowerCase().includes(query)
      )
    }

    return lists
  }, [data, debouncedQuery])

  const handleListClick = (listId: string) => {
    router.push(`/lists/shared/${listId}`)
  }

  const getMenuOptions = (list: List) => {
    return [
      {
        key: 'info',
        icon: <IconInfoCircle size={20} />,
        title: t('moreInfo'),
        onClick: () => {
          modals.open({
            title: t('infoModalTitle'),
            children: (
              <Stack gap="xs">
                <Text size="sm">
                  <strong>{t('infoTitle')}:</strong> {list.title}
                </Text>
                <Text size="sm">
                  <strong>{t('infoDescription')}:</strong> {list.description || t('noDescription')}
                </Text>
                <Text size="sm">
                  <strong>{t('infoOwner')}:</strong> {(list as SharedList).owner.name} ({(list as SharedList).owner.email})
                </Text>
                <Text size="sm">
                  <strong>{t('infoCreatedAt')}:</strong> {dayjs(list.createdAt).format('DD MMM YYYY, HH:mm')}
                </Text>
                <Text size="sm">
                  <strong>{t('infoUpdatedAt')}:</strong> {dayjs(list.updatedAt).format('DD MMM YYYY, HH:mm')}
                </Text>
                {list.archivedAt && (
                  <Text size="sm">
                    <strong>{t('infoArchivedAt')}:</strong> {dayjs(list.archivedAt).format('DD MMM YYYY, HH:mm')}
                  </Text>
                )}
              </Stack>
            )
          })
        }
      }
    ]
  }

  if (isLoading) {
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>{t('title')}</Title>
          <Text c="dimmed">
            {t('listCount', { count: filteredData.length })}
          </Text>
        </div>
      </Group>
      <Stack mb="md" gap="sm">
        <Group gap="sm" align="center">
          <TextInput
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.currentTarget.value)}
            flex={1}
          />
        </Group>
      </Stack>
      <Grid>
        {filteredData.map(list => (
          <Grid.Col key={list.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card
              withBorder
              radius="md"
              p="lg"
              h="100%"
              style={{
                cursor: 'pointer',
                transition: '0.15s'
              }}
              onClick={() => handleListClick(list.id)}
              onContextMenu={
                showContextMenu(getMenuOptions(list), {
                  styles: contextMenuStyles
                })
              }
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <ThemeIcon radius="xl" size="lg" color={list.color ?? 'gray'} variant="light">
                    <IconUsers size={18} />
                  </ThemeIcon>

                  <Group gap="xs">
                    {list.archivedAt && (
                      <Badge color="gray" variant="light">
                        {t('archived')}
                      </Badge>
                    )}

                    <Badge variant="outline">{dayjs(list.updatedAt).format('DD MMM')}</Badge>
                  </Group>
                </Group>

                <div>
                  <Title order={4}>{list.title}</Title>

                  <Text c="dimmed" size="sm" lineClamp={2} mt={4}>
                    {list.description || t('noDescription')}
                  </Text>
                </div>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  )
}