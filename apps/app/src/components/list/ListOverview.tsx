import { List } from "@/models/lists"
import { Center, Loader, Container, Group, Title, ActionIcon, Grid, Card, Stack, ThemeIcon, Badge, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconPlus, IconList } from "@tabler/icons-react"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"

type ListOverviewProps = {
  shared: boolean | undefined
  data: List[]
  isLoading: boolean
}

export default function ListOverview({ shared, data, isLoading }: ListOverviewProps) {
  const router = useRouter()

  const handleAddList = () => {
    modals.openContextModal({
      modal: 'addList',
      title: 'Add New List',
      innerProps: undefined,
      size: 'lg'
    })
  }

  const handleListClick = (listId: string) => {
    const path = shared ? `/lists/shared/${listId}` : `/lists/${listId}`
    router.push(path)
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
          <Title order={1}>My Lists</Title>
          <Text c="dimmed">
            {data.length} {data.length === 1 ? 'list' : 'lists'}
          </Text>
        </div>
        {shared === false && (
          <ActionIcon
            size="lg"
            radius="md"
            variant="filled"
            onClick={handleAddList}
          >
            <IconPlus size={20} />
          </ActionIcon>
        )}
      </Group>

      <Grid>
        {data.map((list) => (
          <Grid.Col key={list.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card
              withBorder
              radius="md"
              p="lg"
              h="100%"
              style={{
                cursor: 'pointer',
                transition: '0.15s',
              }}
              onClick={() => handleListClick(list.id)}
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <ThemeIcon
                    radius="xl"
                    size="lg"
                    color={list.color ?? 'gray'}
                    variant="light"
                  >
                    <IconList size={18} />
                  </ThemeIcon>

                  <Badge variant="light">
                    {dayjs(list.updatedAt).format('DD MMM')}
                  </Badge>
                </Group>

                <div>
                  <Title order={4}>{list.title}</Title>

                  <Text
                    c="dimmed"
                    size="sm"
                    lineClamp={2}
                    mt={4}
                  >
                    {list.description || 'No description'}
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