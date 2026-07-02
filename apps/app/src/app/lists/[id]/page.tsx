'use client';

import { useParams } from 'next/navigation';
import { useListById, useUpdateList } from '@/queries/lists';
import {
  ActionIcon,
  Center,
  Collapse,
  Container,
  Group,
  Loader,
  Stack,
  Title,
  Text,
  Divider,
} from '@mantine/core';
import { EditableTitle } from '@/components/list/EditableText';
import AddTask from '@/components/list/AddTask';
import { CreateTaskInput } from '@/models/task';
import { useCreateTask, useToggleCompleteTask } from '@/queries/task';
import TaskList from '@/components/task/TaskList';
import { useMemo, useState } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import AddSection from '@/components/list/AddSection';
import { useCreateSection } from '@/queries/section';


export default function ListPage() {
  const params = useParams();

  const { data, isLoading } = useListById(params.id as string);
  const [sectionExpanded, setSectionExpanded] = useState<Record<string, boolean>>({});
  const updateList = useUpdateList();
  const createTask = useCreateTask();
  const createSection = useCreateSection();
  const toggleTask = useToggleCompleteTask();
  // const reorderTasks = useReorderTasks();

  const list = data?.data;

  const orderedSections = useMemo(() => {
    if (!list) return [];
    return [...list.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [list]);

  const handleSaveTitle = async (newTitle: string) => {
    if (!list) return;

    await updateList.mutateAsync({
      id: list.id,
      title: newTitle,
    });
  };

  const handleAddTask = async (task: CreateTaskInput) => {
    await createTask.mutateAsync(task);
  };

  const handleAddSection = async (listId: string, title: string, order: number | undefined) => {
    await createSection.mutateAsync({ listId, title, order });
  };

  if (!list && !isLoading) return null;

  if (isLoading && !list) {
    return (
      <Center>
        <Loader size="xl" />
      </Center>
    );
  } else if (!list) {
    return (
      <Center>
        <Title order={2}>List not found</Title>
      </Center>
    );
  }

  return (
    <Container>
      <Stack>
        <EditableTitle onSave={handleSaveTitle} value={list.title} />
        {orderedSections.length > 0 && (
          <Stack gap={'xs'}>
            {orderedSections.map((section) => {
              if (section.id === list.defaultSectionId) {
                return (
                  <div key={section.id}>
                    <TaskList
                      data={list.tasks.filter(
                        task => task.sectionId === list.defaultSectionId
                      )}
                      onToggle={(task) =>
                        toggleTask.mutate({
                          listId: list.id,
                          taskId: task.id,
                        })
                      }
                    />
                    <AddTask ml={38} listId={list.id} sectionId={list.defaultSectionId} onSave={handleAddTask} />
                    <AddSection order={2} listId={list.id} key={section.id} onSave={handleAddSection} />
                  </div>
                )
              } else {
                return (
                  <div key={section.id}>
                    <Group gap={4} align='center'>
                      <ActionIcon
                        variant='subtle'
                        color='gray'
                        size='sm'
                        onClick={() => {
                          setSectionExpanded((prev) => ({
                            ...prev,
                            [section.id]: !prev[section.id],
                          }));
                        }}
                      >
                        {sectionExpanded[section.id] ?? true ? <IconChevronDown /> : <IconChevronRight />}
                      </ActionIcon>
                      <Title m={0} mt={4} order={4}>
                        {section.title}
                      </Title>
                      <Text size='sm' c='gray' ml={4}>
                        ({list.tasks.filter((task) => task.sectionId === section.id).length})
                      </Text>
                    </Group>
                    <Divider ml={28} mr={8} />
                    <Collapse expanded={sectionExpanded[section.id] ?? true}>
                      <TaskList
                        data={list.tasks.filter((task) => task.sectionId === section.id)}
                        onToggle={(task) =>
                          toggleTask.mutate({
                            listId: list.id,
                            taskId: task.id,
                          })
                        }
                      />
                      <AddTask ml={38} listId={list.id} sectionId={section.id} onSave={handleAddTask} />
                    </Collapse>
                    <AddSection order={section.order} listId={list.id} key={section.id} onSave={handleAddSection} />
                  </div>
                )
              }
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}