// types/task.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  label: "Feature" | "Bug" | "Issue" | "Undefined";
  priority?: "Low" | "Medium" | "High";
  checklist: ChecklistItem[];
  attachments: string[];
  coverImage?: string;
  columnId: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface FilterOptions {
  assignee: string;
  label: string;
  dueDate: string;
}
