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

const isClient = ref(false);
onMounted(() => {
  isClient.value = true;
});

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
        <ion-button fill="clear" @click="openTaskModal('todo')">
          <ion-icon :icon="addOutline" />
          Add Task
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="column in filteredColumns"
          :key="column.id"
          class="bg-gray-100 p-3 rounded-xl"
        >
          <h3 class="font-semibold mb-2">{{ column.title }}</h3>

          <client-only>
            <draggable
              v-if="isClient"
              :list="column.tasks"
              group="tasks"
              @change="onTaskMove"
              item-key="id"
              :data-column-id="column.id"
              class="min-h-[50px]"
            >
              <template #item="{ element }">
                <div
                  class="bg-white rounded-lg shadow-sm p-3 mb-2 cursor-pointer"
                  @click="openTaskModal(column.id, element)"
                >
                  <p class="font-medium text-gray-700">
                    {{ element.description || "Untitled Task" }}
                  </p>
                </div>
              </template>
            </draggable>
          </client-only>
        </div>
      </div>
    </ion-content>
  </ion-page>

  <ClientOnly>
    <TaskModal
      :is-open="isModalOpen"
      :task="selectedTask"
      :column-id="selectedColumnId"
      @close="closeModal"
      @save="handleSaveTask"
    />
  </ClientOnly>
</template>
