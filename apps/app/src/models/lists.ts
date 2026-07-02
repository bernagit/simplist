import { Section } from "./section";
import { Task } from "./task";

export type List = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type AllList = {
  owned: List[];
  shared: List[];
}

export type ListMember = {
  id: string;
  listId: string;
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
}

export type CompleteList = List & {
  members: ListMember[];
  sections: Section[];
  tasks: Task[];
  defaultSectionId: string | null;
}

export type UpdateListInput = {
  id: string;
  title: string;
}