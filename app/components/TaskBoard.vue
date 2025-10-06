<script setup lang="ts">
import { ref } from "vue";
import draggable from "vuedraggable";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
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
        <ion-title>Task Board</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Filter dan Search -->
      <TaskFilters />

      <!-- Board Columns -->
      <div class="board-container">
        <div v-for="column in filteredColumns" :key="column.id" class="column">
          <ion-card>
            <ion-card-header>
              <ion-card-title class="column-title">
                {{ column.title }} ({{ column.tasks.length }})
              </ion-card-title>
            </ion-card-header>

            <ion-card-content class="column-content">
              <ion-button
                expand="block"
                fill="outline"
                size="small"
                @click="openTaskModal(column.id)"
              >
                <ion-icon :icon="addOutline" slot="start" />
                Add Task
              </ion-button>

              <!-- draggable untuk task di kolom ini -->
              <client-only>
                <draggable
                  v-model="column.tasks"
                  group="tasks"
                  item-key="id"
                  class="task-list"
                  @change="(event: any) => onTaskMove(event, column.id)"
                  @end="saveToStorage()"
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
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Task Modal -->
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

<style scoped>
.board-container {
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow-x: auto;
  min-height: calc(100vh - 200px);
}

.column {
  min-width: 300px;
  flex: 1;
}

.column-title {
  font-size: 1.1em;
  font-weight: 600;
}

.column-content {
  padding: 8px 0;
}

.task-list {
  min-height: 100px;
  margin-top: 12px;
  gap: 8px;
  display: flex;
  flex-direction: column;
}
</style>
