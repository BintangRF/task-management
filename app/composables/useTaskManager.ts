import { ref, computed, onMounted } from "vue";
import type { Column, Task } from "~/types/task";
import { getCoverImage, saveCoverImage } from "./useIndexedDB";

let initialized = false;

const columns = ref<Column[]>([
  { id: "todo", title: "To Do", tasks: [] },
  { id: "doing", title: "Doing", tasks: [] },
  { id: "review", title: "Review", tasks: [] },
  { id: "done", title: "Done", tasks: [] },
  { id: "rework", title: "Rework", tasks: [] },
]);

const filterOptions = ref({
  assignee: "",
  label: "",
  dueDate: "",
});

const searchQuery = ref("");

const loadFromStorage = () => {
  if (process.client) {
    const saved = localStorage.getItem("task-board");
    if (saved) {
      const data = JSON.parse(saved);
      columns.value = data.columns || columns.value;
    }
  }
};

const saveToStorage = () => {
  if (process.client) {
    localStorage.setItem(
      "task-board",
      JSON.stringify({
        columns: columns.value,
      })
    );
  }
};

const createTask = async (
  task: Omit<Task, "id" | "createdAt"> & { coverFile?: File | null }
) => {
  const newTask: Task = {
    ...task,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
    coverImage: "", // nanti akan diisi setelah save ke IndexedDB
  };

  const column = columns.value.find((c) => c.id === task.columnId);
  if (column) {
    column.tasks.push(newTask);
    saveToStorage();

    if (task.coverFile) {
      await saveCoverImage(newTask.id, task.coverFile);
      newTask.coverImage = (await getCoverImage(newTask.id))!;
    }
  }
};

const updateTask = async (
  taskId: string,
  updates: Partial<Task> & { coverFile?: File | null }
) => {
  for (const column of columns.value) {
    const i = column.tasks.findIndex((t) => t.id === taskId);
    if (i !== -1) {
      column.tasks[i] = { ...column.tasks[i], ...updates } as Task;
      if (updates.coverFile !== undefined) {
        await saveCoverImage(taskId, updates.coverFile);
        column.tasks[i].coverImage = (await getCoverImage(taskId))!;
      }
      saveToStorage();
      break;
    }
  }
};

const deleteTask = (taskId: string) => {
  for (const column of columns.value) {
    const i = column.tasks.findIndex((t) => t.id === taskId);
    if (i !== -1) {
      column.tasks.splice(i, 1);
      saveToStorage();
      break;
    }
  }
};

const getChecklistProgress = (checklist: { done: boolean }[] = []) => {
  if (!checklist.length) return 0;
  const done = checklist.filter((item) => item.done).length;
  return Math.round((done / checklist.length) * 100);
};

const moveTask = (taskId: string, newColumnId: string) => {
  let taskToMove: Task | null = null;
  let sourceColumnIndex = -1;
  let taskIndex = -1;

  for (let i = 0; i < columns.value.length; i++) {
    const column = columns.value[i];
    const idx = column!.tasks.findIndex((task) => task.id === taskId);
    if (idx !== -1) {
      taskToMove = column!.tasks[idx] || null;
      sourceColumnIndex = i;
      taskIndex = idx;
      break;
    }
  }

  if (taskToMove && sourceColumnIndex !== -1) {
    // Hapus dari kolom sumber
    columns.value[sourceColumnIndex]!.tasks.splice(taskIndex, 1);

    // Tambahkan ke kolom tujuan
    const targetColumn = columns.value.find((c) => c.id === newColumnId);
    if (targetColumn) {
      targetColumn.tasks.push({ ...taskToMove, columnId: newColumnId });
      saveToStorage();
    }
  }
};

function matchDateQuery(taskDate: string, query: string): boolean {
  if (!taskDate) return false;

  try {
    // Konversi tanggal task ke bentuk Date
    const date = new Date(taskDate);

    // Format tanggal ke berbagai bentuk teks yang bisa dicari
    const formattedVariants = [
      date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }), // contoh: "03 September 2025"
      date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }), // contoh: "3 September 2025"
      date.toLocaleDateString("id-ID"), // contoh: "03/09/2025"
      date.toISOString().split("T")[0], // contoh: "2025-09-03"
    ];

    // Cek apakah query cocok dengan salah satu variasi format
    return formattedVariants.some((variant) =>
      variant!.toLowerCase().includes(query)
    );
  } catch {
    return false;
  }
}

const isFiltering = computed(() => {
  return (
    searchQuery.value.toLowerCase().trim() !== "" ||
    !!filterOptions.value.label ||
    !!filterOptions.value.dueDate
  );
});

const filteredColumns = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const hasFilter = isFiltering.value;

  // Jika tidak ada filter/search, kembalikan array sumber agar drag dapat mengubahnya langsung
  if (!hasFilter) {
    return columns.value;
  }

  // Jika ada filter, kembalikan versi 'visual' (filtered) — drag akan dinonaktifkan di mode ini
  return columns.value.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (task.assignee?.toLowerCase() || "").includes(query) ||
        (task.label?.toLowerCase() || "").includes(query) ||
        (task.priority?.toLowerCase() || "").includes(query) ||
        matchDateQuery(task.dueDate, query);

      const matchesLabel =
        !filterOptions.value.label || task.label === filterOptions.value.label;

      const matchesDueDate =
        !filterOptions.value.dueDate ||
        task.dueDate === filterOptions.value.dueDate;

      return matchesSearch && matchesLabel && matchesDueDate;
    }),
  }));
});

export function useTaskManager() {
  if (!initialized) {
    onMounted(() => loadFromStorage());
    initialized = true;
  }

  return {
    filteredColumns,
    filterOptions,
    isFiltering,
    searchQuery,
    createTask,
    updateTask,
    deleteTask,
    getChecklistProgress,
    moveTask,
    saveToStorage,
  };
}
