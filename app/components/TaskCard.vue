<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
} from "@ionic/vue";
import {
  createOutline,
  calendarOutline,
  documentAttachOutline,
  trashOutline,
} from "ionicons/icons";
import { type Task } from "~/types/task";
import { useTaskManager } from "~/composables/useTaskManager";
import { getCoverImage } from "~/composables/useIndexedDB";

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

const coverImage = ref<string | null>(null);

onMounted(async () => {
  coverImage.value = await getCoverImage(props.task.id);

  coverImageBus.on("updated", async ({}) => {
    coverImage.value = await getCoverImage(props.task.id);
  });
});

onUnmounted(() => {
  coverImageBus.all.clear();
});

const onDragStart = (event: DragEvent) => {
  event.dataTransfer?.setData("text/plain", props.task.id);
};

const getLabelColor = (label: string) => {
  const colors: Record<string, string> = {
    Feature: "bg-green-200 text-green-800",
    Bug: "bg-red-200 text-red-800",
    Issue: "bg-yellow-200 text-yellow-800",
    Undefined: "bg-gray-200 text-gray-700",
  };
  return colors[label] || "bg-gray-200 text-gray-700";
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };
  return colors[priority] || "bg-gray-200 text-gray-700";
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
  <ion-card
    class="task-card rounded-xl shadow-none bg-blue-50 transition cursor-grab"
    draggable="true"
    @dragstart="onDragStart"
  >
    <!-- Cover Image -->
    <img
      v-if="coverImage"
      :src="coverImage"
      alt="Cover Image"
      class="w-full h-56 object-cover rounded-t-2xl p-2"
    />

    <ion-card-header class="px-4 pt-4!">
      <!-- Header: Title + Buttons -->
      <div class="flex justify-between items-start">
        <div v-if="task.attachments.length > 0" class="flex items-center gap-1">
          <ion-icon :icon="documentAttachOutline" />
          <span>{{ task.attachments.length }} files</span>
        </div>

        <!-- Action Buttons: Edit & Delete -->
        <div class="flex items-center ml-auto gap-1">
          <!-- Edit Button -->
          <ion-button
            fill="clear"
            size="small"
            class="text-gray-500 hover:text-blue-500 transition"
            @click.stop="$emit('edit')"
          >
            <ion-icon :icon="createOutline" />
          </ion-button>

          <!-- Delete Button -->
          <ion-button
            fill="clear"
            size="small"
            class="text-red-500 hover:text-red-700 transition"
            @click.stop="$emit('delete')"
          >
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </div>
      </div>

      <!-- Labels -->
      <div class="flex flex-wrap gap-2 my-2">
        <ion-chip
          class="px-1 py-0.5 rounded-full text-xs min-w-[64px] flex items-center justify-center"
          :class="getLabelColor(task.label)"
        >
          {{ task.label }}
        </ion-chip>

        <ion-chip
          v-if="task.priority"
          class="px-1 py-0.5 rounded-full text-xs min-w-[64px] flex items-center justify-center"
          :class="getPriorityColor(task.priority)"
        >
          {{ task.priority }}
        </ion-chip>
      </div>

      <!-- Checklist Progress -->
      <div v-if="(task.checklist || []).length > 0" class="mt-2">
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
          <div
            class="h-full bg-blue-400 transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </ion-card-header>

    <ion-card-content class="px-4 pb-4!">
      <!-- Description -->
      <p class="text-gray-600 text-sm my-5! line-clamp-2">
        {{ task.description }}
      </p>

      <!-- Due Date, Attachment, Assignee -->
      <div
        class="flex items-center justify-between text-gray-500 text-xs gap-2 flex-wrap mb-3"
      >
        <div class="flex items-center gap-1">
          <ion-icon :icon="calendarOutline" />
          <span>{{ formatDate(task.dueDate) }}</span>
        </div>

        <!-- Assignee Avatars -->
        <div class="flex -space-x-2">
          <!-- Tampilkan maksimal 3 avatar -->
          <img
            v-for="(member, idx) in task.assignee.slice(0, 3)"
            :key="member"
            :src="'https://i.pravatar.cc/40?u=' + member"
            class="w-6 h-6 rounded-full border-2 border-white"
          />

          <!-- Jika lebih dari 3, tampilkan jumlah tersisa -->
          <div
            v-if="task.assignee.length > 3"
            class="w-6 h-6 flex items-center justify-center text-xs bg-gray-200 text-gray-600 rounded-full border-2 border-white"
          >
            +{{ task.assignee.length - 3 }}
          </div>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>
