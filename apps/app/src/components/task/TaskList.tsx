"use client";

import { Task } from "@/models/task";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Stack } from "@mantine/core";
import { useMemo } from "react";
import TaskRow from "./TaskRow";

type TaskListProps = {
  data: Task[];
  onReorder?: (tasks: Task[]) => void | Promise<void>;
  onToggle: (task: Task) => void | Promise<void>;
};

export default function TaskList({
  data,
  onReorder,
  onToggle,
}: TaskListProps) {
  const tasks = useMemo(
    () => [...data].sort((a, b) => a.order - b.order),
    [data]
  );
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const ids = useMemo(
    () => tasks.map((t) => t.id),
    [tasks]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const reordered = arrayMove(tasks, oldIndex, newIndex).map(
      (task, index) => ({
        ...task,
        order: index,
      })
    );

    await onReorder?.(reordered);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={verticalListSortingStrategy}
      >
        <Stack gap={0}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}