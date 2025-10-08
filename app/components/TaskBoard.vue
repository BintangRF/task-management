<script setup lang="ts">
import { ref } from "vue";
import draggable from "vuedraggable";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { addOutline } from "ionicons/icons";
import { type Task } from "~/types/task";
import { useTaskManager } from "~/composables/useTaskManager";

const {
  filteredColumns,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  saveToStorage,
} = useTaskManager();

const isModalOpen = ref(false);
const selectedTask = ref<Task | null>(null);
const selectedColumnId = ref<string>("");

// Modal handlers
const openTaskModal = (columnId: string, task: Task | null = null) => {
  selectedColumnId.value = columnId;
  selectedTask.value = task;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedTask.value = null;
  selectedColumnId.value = "";
};

const handleSaveTask = (taskData: any) => {
  if (selectedTask.value) {
    // Update existing task
    updateTask(selectedTask.value.id, taskData);
  } else {
    // Create new task
    createTask({
      ...taskData,
      columnId: selectedColumnId.value,
    });
  }
  closeModal();
};

const onTaskMove = async (event: any, columnId: string) => {
  // Jika task dipindahkan antar kolom
  if (event.added && event.added.element.columnId !== columnId) {
    moveTask(event.added.element.id, columnId);
  }

  // Jika task hanya ditukar di kolom yang sama
  if (event.moved) {
    // Urutan dalam array `column.tasks` sudah otomatis berubah oleh v-model
    // Jadi cukup simpan ulang
    saveToStorage();
  }

  await nextTick();
  saveToStorage();
};
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <Header />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div
        class="flex gap-4 p-4 overflow-x-auto scrollbar-none md:flex-row flex-col not-md:items-center min-h-full"
      >
        <div
          v-for="column in filteredColumns"
          :key="column.id"
          class="bg-white flex-shrink-0 max-w-[320px] w-full"
        >
          <!-- Column Header -->
          <div class="flex items-center justify-between px-3 py-2">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-semibold text-gray-800">
                {{ column.title }}
              </h3>
              <ion-button
                size="small"
                style="
                  --background: #93c5fd;
                  --color: white;
                  --box-shadow: none;
                "
                class="flex items-center gap-1"
                @click="openTaskModal(column.id)"
              >
                <ion-icon :icon="addOutline" class="text-base text-blue-800" />
              </ion-button>
            </div>
          </div>

          <!-- Task List -->
          <div class="px-2 py-2 flex flex-col gap-2 min-h-[450px]">
            <client-only>
              <draggable
                v-model="column.tasks"
                group="tasks"
                item-key="id"
                class="flex flex-col gap-2"
                @change="(event: any) => onTaskMove(event, column.id)"
              >
                <template #item="{ element: task }">
                  <TaskCard
                    :task="task"
                    @edit="openTaskModal(task.columnId, task)"
                    @delete="deleteTask(task.id)"
                  />
                </template>
              </draggable>
            </client-only>

            <div
              v-if="column.tasks.length === 0"
              class="text-gray-400 text-center text-sm py-24 italic bg-blue-50 rounded-xl"
            >
              No tasks available
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        :is-open="isModalOpen"
        :task="selectedTask"
        :column-id="selectedColumnId"
        @close="closeModal"
        @save="handleSaveTask"
      />
    </ion-content>
  </ion-page>
</template>
