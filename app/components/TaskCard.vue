<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonAvatar,
} from "@ionic/vue";
import {
  createOutline,
  calendarOutline,
  documentAttachOutline,
  trashOutline,
} from "ionicons/icons";
import { type Task } from "~/types/task";
import { useTaskManager } from "~/composables/useTaskManager";
import { getCoverImage } from "~/composables/useIndexedDB"; // composable IndexedDB

interface Props {
  task: Task;
}

interface Emits {
  (e: "edit"): void;
  (e: "delete"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { getChecklistProgress } = useTaskManager();
const progress = computed(() =>
  getChecklistProgress(props.task.checklist || [])
);

// **State untuk cover image**
const coverImage = ref<string | null>(null);

// Ambil cover image saat component mount
onMounted(async () => {
  coverImage.value = await getCoverImage(props.task.id);
});

const onDragStart = (event: DragEvent) => {
  event.dataTransfer?.setData("text/plain", props.task.id);
};

const getLabelColor = (label: string) => {
  const colors: any = {
    Feature: "success",
    Bug: "danger",
    Issue: "warning",
    Undefined: "medium",
  };
  return colors[label] || "medium";
};

const getPriorityColor = (priority: string) => {
  const colors: any = {
    High: "danger",
    Medium: "warning",
    Low: "success",
  };
  return colors[priority] || "medium";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
</script>

<template>
  <ion-card class="task-card" draggable="true" @dragstart="onDragStart">
    <!-- Cover Image -->
    <img
      v-if="coverImage"
      :src="coverImage"
      alt="Cover Image"
      class="task-cover-image"
    />

    <ion-card-header>
      <div class="task-header">
        <ion-card-title class="task-title">{{ task.title }}</ion-card-title>
        <ion-button fill="clear" size="small" @click.stop="$emit('edit')">
          <ion-icon :icon="createOutline" />
        </ion-button>
      </div>

      <!-- Labels -->
      <ion-chip :color="getLabelColor(task.label)" outline>
        {{ task.label }}
      </ion-chip>

      <ion-chip
        v-if="task.priority"
        :color="getPriorityColor(task.priority)"
        outline
      >
        {{ task.priority }}
      </ion-chip>
    </ion-card-header>

    <ion-card-content>
      <!-- Description -->
      <p class="task-description">{{ task.description }}</p>

      <!-- Assignee -->
      <div class="task-meta">
        <ion-avatar class="assignee-avatar">
          <img
            :src="`https://i.pravatar.cc/40?u=${task.assignee}`"
            :alt="task.assignee"
          />
        </ion-avatar>
        <span class="assignee-name">{{ task.assignee }}</span>
      </div>

      <!-- Due Date -->
      <div class="task-meta">
        <ion-icon :icon="calendarOutline" />
        <span>{{ formatDate(task.dueDate) }}</span>
      </div>

      <!-- Checklist Progress -->
      <div v-if="(task.checklist || []).length > 0" class="checklist-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>

      <!-- Attachments -->
      <div v-if="task.attachments.length > 0" class="attachments">
        <ion-icon :icon="documentAttachOutline" />
        <span>{{ task.attachments.length }} files</span>
      </div>

      <!-- Delete Button -->
      <ion-button
        expand="block"
        color="danger"
        size="small"
        @click.stop="$emit('delete')"
      >
        <ion-icon :icon="trashOutline" slot="start" />
        Delete
      </ion-button>
    </ion-card-content>
  </ion-card>
</template>

<style scoped>
.task-card {
  margin-bottom: 12px;
  cursor: grab;
}

.task-card:active {
  cursor: grabbing;
}

.task-cover-image {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  margin-bottom: 8px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  font-size: 1em;
  margin: 0;
  flex: 1;
}

.task-description {
  font-size: 0.9em;
  color: var(--ion-color-medium);
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 0.8em;
  color: var(--ion-color-medium);
}

.assignee-avatar {
  width: 24px;
  height: 24px;
}

.assignee-name {
  font-size: 0.9em;
}

.checklist-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: var(--ion-color-light);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--ion-color-success);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8em;
  color: var(--ion-color-medium);
  min-width: 30px;
}

.attachments {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0;
  font-size: 0.8em;
  color: var(--ion-color-medium);
}
</style>
