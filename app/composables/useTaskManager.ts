import { ref, computed, onMounted } from "vue";
import type { Column, Task } from "~/types/task";
import { getCoverImage, saveCoverImage } from "./useIndexedDB";
import { useToast } from "~/composables/useToast";

let initialized = false;
const { showToast } = useToast();

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
  task: Omit<Task, "id" | "createdAt"> & { coverImage?: File | null }
) => {
  try {
    const newTask: Task = {
      ...task,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      coverImage: "",
    };

    const column = columns.value.find((c) => c.id === task.columnId);
    if (!column) throw new Error("Column not found");

    column.tasks.push(newTask);
    saveToStorage();

    if (task.coverImage) {
      await saveCoverImage(newTask.id, task.coverImage);
      newTask.coverImage = (await getCoverImage(newTask.id))!;
    }

    showToast("Task berhasil dibuat", "success");
    return newTask;
  } catch (err) {
    showToast("Gagal membuat task", "error");
    throw err;
  }
};

const updateTask = async (
  taskId: string,
  updates: Partial<Task> & { coverImage?: File | null }
) => {
  try {
    for (const column of columns.value) {
      const i = column.tasks.findIndex((t) => t.id === taskId);
      if (i !== -1) {
        column.tasks[i] = { ...column.tasks[i], ...updates } as Task;

        if (updates.coverImage !== undefined) {
          await saveCoverImage(taskId, updates.coverImage);
          column.tasks[i].coverImage = (await getCoverImage(taskId))!;
        }

        saveToStorage();
        showToast("Task berhasil diperbarui", "success");
        return;
      }
    }

    throw new Error("Task tidak ditemukan");
  } catch (err) {
    showToast("Gagal memperbarui task", "error");
    throw err;
  }
};

const deleteTask = async (taskId: string) => {
  try {
    for (const column of columns.value) {
      const i = column.tasks.findIndex((t) => t.id === taskId);
      if (i !== -1) {
        column.tasks.splice(i, 1);
        saveToStorage();
        showToast("Task berhasil dihapus", "success");
        return;
      }
    }
    throw new Error("Task tidak ditemukan");
  } catch (err) {
    showToast("Gagal menghapus task", "error");
    throw err;
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
    !!filterOptions.value.dueDate ||
    !!filterOptions.value.assignee
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
        task.description.toLowerCase().includes(query) ||
        task.assignee.some((a) => a.toLowerCase().includes(query)) ||
        (task.label?.toLowerCase() || "").includes(query) ||
        (task.priority?.toLowerCase() || "").includes(query) ||
        matchDateQuery(task.dueDate, query);

      const filterLabel = filterOptions.value.label?.toLowerCase() || "";
      const taskLabel = task.label?.toLowerCase() || "";
      const matchesLabel = !filterLabel || taskLabel === filterLabel;

      const matchesDueDate = (() => {
        const filterDate = filterOptions.value.dueDate;
        const taskDate = task.dueDate;

        if (!filterDate) return true;
        if (!taskDate) return false;

        try {
          const d1 = new Date(filterDate);
          const d2 = new Date(taskDate);

          return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
          );
        } catch {
          return false;
        }
      })();

      const filterAssignee =
        filterOptions.value.assignee?.toLowerCase().trim() || "";
      const matchesAssignee =
        !filterAssignee ||
        task.assignee.some((a) => a.toLowerCase().includes(filterAssignee));

      return matchesSearch && matchesLabel && matchesDueDate && matchesAssignee;
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
