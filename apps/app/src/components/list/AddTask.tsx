"use client";

import { CreateTaskInput } from "@/models/task";
import { Box, Button, Card, Group, Stack, Text, TextInput, useMantineTheme } from "@mantine/core";
import { useColorScheme, useHotkeys } from "@mantine/hooks";
import { IconCirclePlus, IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import DateSelector from "../task/DateSelector";
import PrioritySelector from "../task/ProritySelector";

type AddTaskProps = {
  ml?: number;
  listId: string;
  sectionId?: string | null;
  onSave?: (task: CreateTaskInput) => Promise<void> | void;
};

export default function AddTask({ ml, listId, sectionId, onSave }: AddTaskProps) {
  const colorScheme = useColorScheme();
  const theme = useMantineTheme();
  const [isClicked, setIsClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const clearInputs = () => {
    setTitle("");
    setDescription("");
    setSelectedDate(null);
    setSelectedPriority(null);
  };

  const handleSave = useCallback(async () => {
    if (title.trim().length === 0) return;

    const task: CreateTaskInput = {
      listId: listId,
      sectionId: sectionId || null,
      title: title.trim(),
      description: description.trim() || null,
      dueDate: selectedDate ? new Date(selectedDate) : null,
      priority: selectedPriority,
    };

    if (onSave) {
      await onSave(task);
    }

    clearInputs();
    // keep the input open after saving
    setIsClicked(true);
    requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  }, [title, listId, sectionId, description, selectedDate, selectedPriority, onSave]);

  useHotkeys([["Escape", () => {
    clearInputs();
    setIsClicked(false);
  }]]);

  useEffect(() => {
    if (isClicked) {
      requestAnimationFrame(() => {
        titleInputRef.current?.focus();
      });
    }
  }, [isClicked]);

  if (!isClicked) {
    return (
      <Box
        onClick={() => setIsClicked(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        ml={ml ?? 0}
        style={{
          width: "100%",
          cursor: "pointer",
          borderRadius: 6,
          padding: "6px 8px",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          transition: "color 120ms ease",
          color: hovered
            ? theme.colors[theme.primaryColor]?.[8]
            : "var(--mantine-color-dimmed)",
        }}
      >
        <Group gap={6}>
          {!hovered ? (<IconPlus size={16} />) : (<IconCirclePlus size={16} />)}

          <Text
            mt={4}
            size="sm"
            fw={500}
            c="inherit"
          >
            Add Task
          </Text>
        </Group>
      </Box>
    );
  }

  return (
    <Card
      withBorder
      radius="md"
      p="xs"
      style={{
        width: "100%",
        borderColor:
          colorScheme === "dark"
            ? "var(--mantine-color-dark-4)"
            : "var(--mantine-color-gray-3)",
      }}
      mt="xs"
      ml={"lg"}
      w={"90%"}
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }} >
        <Stack gap={0} p={0}>
          <TextInput
            ref={titleInputRef}
            variant="unstyled"
            placeholder="Task name"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            styles={{
              root: {
                margin: 0,
              },
              wrapper: {
                margin: 0,
              },
              input: {
                height: 26,
                minHeight: 20,
                lineHeight: "26px",
                padding: 0,
                fontSize: 15,
                fontWeight: 600,
              },
            }}
          />
          <TextInput
            variant="unstyled"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            mt="xs"
            styles={{
              input: {
                height: 20,
                minHeight: 18,
                lineHeight: "20px",
                padding: 0,
                fontSize: 13,
              },
            }}
          />
          <Group gap={'xs'} m={0}>
            <DateSelector
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            <PrioritySelector
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
            />
          </Group>

          <Group
            justify="flex-end"
            mt="xs"
            pt="xs"
            style={{
              borderTop:
                colorScheme === "dark"
                  ? "1px solid var(--mantine-color-dark-4)"
                  : "1px solid var(--mantine-color-gray-3)",
            }}
          >
            <Button
              variant="outline"
              color="gray"
              onClick={() => {
                clearInputs();
                setIsClicked(false);
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={title.trim().length === 0}
              type="submit"
            >
              Add task
            </Button>
          </Group>
        </Stack>
      </form>
    </Card >
  );
}