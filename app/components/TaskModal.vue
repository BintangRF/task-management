<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonLabel,
  IonDatetime,
  IonDatetimeButton,
  IonFooter,
} from "@ionic/vue";
import {
  closeOutline,
  addOutline,
  attachOutline,
  documentOutline,
  trashOutline,
  imagesOutline,
  checkmarkOutline,
  chevronDownOutline,
  flagOutline,
  calendarOutline,
  checkmarkCircle,
  peopleOutline,
  pricetagOutline,
  cameraOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { type Task } from "~/types/task";
import { teamMembers } from "~/data/member";

interface Props {
  isOpen: boolean;
  task: Task | null;
  columnId: string;
}

interface Emits {
  (e: "close"): void;
  (e: "save", taskData: any): void;
  (e: "request-close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();

const coverImage = ref<File | null>(null);

const handleCoverImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    coverImage.value = target.files[0];
  }
};

const coverPreview = computed(() => {
  return coverImage.value
    ? (window.URL as any).createObjectURL(coverImage.value)
    : props.task?.coverImage;
});

const formData = ref<
  Omit<Task, "id" | "columnId" | "createdAt"> & {
    priority: "Low" | "Medium" | "High" | undefined;
  }
>({
  description: "",
  assignee: [] as string[],
  dueDate: new Date().toISOString().split("T")[0] || "",
  label: "Feature",
  priority: "Medium",
  checklist: [],
  attachments: [],
});

const toggleAssignee = (name: string) => {
  const idx = formData.value.assignee.indexOf(name);
  if (idx === -1) formData.value.assignee.push(name);
  else formData.value.assignee.splice(idx, 1);
};

const isPopOver = ref(false);
const isFormValid = ref(false);
const popoverTrigger = ref<HTMLElement | null>(null);

// Reset form when modal opens/closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        if (props.task) {
          // Edit mode - populate form with task data
          formData.value = {
            description: props.task.description,
            assignee: [...props.task.assignee],
            dueDate: props.task.dueDate ?? "",
            label: props.task.label,
            priority: props.task.priority || "Medium",
            checklist: [...props.task.checklist],
            attachments: [...props.task.attachments],
          };
        } else {
          // Create mode - reset form
          formData.value = {
            description: "",
            assignee: [],
            dueDate: new Date().toISOString().split("T")[0] || "",
            label: "Feature",
            priority: "Medium",
            checklist: [],
            attachments: [],
          };

          coverImage.value = null;
        }
        validateForm();
      });
    }
  }
);

// Form validation
watch(
  formData,
  () => {
    validateForm();
  },
  { deep: true }
);

const validateForm = () => {
  isFormValid.value =
    formData.value.assignee.length > 0 && !!formData.value.dueDate;
};

// Checklist methods
const addChecklistItem = () => {
  formData.value.checklist.push({
    id: Date.now().toString(),
    text: "",
    done: false,
  });
};

const removeChecklistItem = (index: number) => {
  formData.value.checklist.splice(index, 1);
};

// Attachment methods
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      formData.value.attachments.push(file!.name);
    }
    target.value = "";
  }
};

const removeAttachment = (index: number) => {
  formData.value.attachments.splice(index, 1);
};

const handleSave = () => {
  if (isFormValid.value) {
    const data: any = { ...formData.value };

    // Hanya kirim coverImage kalau user benar-benar upload baru
    if (coverImage.value instanceof File) {
      data.coverImage = coverImage.value;
    }

    emit("save", data);
  }
};

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const checklistProgress = computed(() => {
  if (formData.value.checklist.length === 0) return 0;
  const completed = formData.value.checklist.filter((item) => item.done).length;
  return Math.round((completed / formData.value.checklist.length) * 100);
});
</script>

<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')" class="shadow-xl">
    <ion-header class="bg-white shadow-none">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-lg font-semibold text-gray-900">
          {{ task ? "Edit Task" : "Create New Task" }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            @click="$emit('request-close')"
            class="w-10 h-10 rounded-full text-gray-500 hover:text-gray-700"
            fill="clear"
          >
            <ion-icon :icon="closeOutline" class="text-xl" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg-gray-50">
      <div class="p-4 space-y-4">
        <!-- Cover Image Section -->
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <span
              class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
              >Optional</span
            >
          </div>
          <div class="mt-2">
            <label
              class="block w-full h-80 border-2 border-dashed border-gray-300 rounded-xl relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-gray-50"
              :class="{ 'border-solid border-gray-200': coverPreview }"
            >
              <div
                v-if="!coverPreview"
                class="flex flex-col items-center justify-center h-full text-gray-500"
              >
                <ion-icon
                  :icon="imagesOutline"
                  class="text-3xl mb-2 text-gray-400"
                />
                <span class="text-sm font-medium">Add Cover Image</span>
                <span class="text-xs text-gray-400 mt-1">JPG, PNG or GIF</span>
              </div>
              <img
                v-if="coverPreview"
                :src="coverPreview"
                alt="Cover"
                class="absolute inset-0 w-full h-full object-contain"
              />
              <div
                v-if="coverPreview"
                class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white opacity-0 transition-opacity duration-200 hover:opacity-100"
              >
                <ion-icon :icon="cameraOutline" class="text-xl mb-1" />
                <span class="text-sm">Change Image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                @change="handleCoverImageUpload"
              />
            </label>
          </div>
        </div>

        <!-- Task Details Grid -->
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-gray-900">Task Details</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Assignee -->
            <div class="space-y-2">
              <label
                class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <ion-icon
                  :icon="peopleOutline"
                  class="text-base text-gray-500"
                />
                Assignee
                <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center gap-3">
                <div class="flex">
                  <div
                    v-for="(member, idx) in formData.assignee.slice(0, 3)"
                    :key="member"
                    class="relative"
                    :style="{
                      zIndex: 10 - idx,
                      marginLeft: idx > 0 ? '-8px' : '0',
                    }"
                  >
                    <img
                      :src="'https://i.pravatar.cc/40?u=' + member"
                      class="w-8 h-8 rounded-full border-2 border-white"
                    />
                  </div>
                  <div
                    v-if="formData.assignee.length > 3"
                    class="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium -ml-2"
                  >
                    +{{ formData.assignee.length - 3 }}
                  </div>
                  <div
                    v-if="formData.assignee.length === 0"
                    class="text-sm text-gray-400 italic"
                  >
                    No assignee
                  </div>
                </div>
                <button
                  ref="popoverTrigger"
                  id="assignee-popover"
                  @click="isPopOver = true"
                  class="flex items-center text-center justify-center rounded-full! min-w-8 min-h-8 bg-blue-100 border border-gray-300 px-3! py-3! text-sm text-gray-600 transition-all duration-200"
                >
                  <ion-icon :icon="addOutline" class="text-base" />
                </button>
              </div>
              <div
                v-if="formData.assignee.length === 0"
                class="flex items-center gap-1 text-xs text-red-500"
              >
                <ion-icon :icon="alertCircleOutline" class="text-sm" />
                At least one assignee is required
              </div>

              <!-- Popover for Assignee Selection -->
              <ClientOnly>
                <ion-popover
                  trigger="assignee-popover"
                  :is-open="isPopOver"
                  :presenting-element="popoverTrigger"
                  @didDismiss="isPopOver = false"
                >
                  <div class="p-4 border-b border-gray-200">
                    <h4 class="text-base font-semibold text-gray-900 mb-1">
                      Select Assignees
                    </h4>
                    <span class="text-sm text-gray-500"
                      >{{ formData.assignee.length }} selected</span
                    >
                  </div>
                  <ion-list class="py-2 max-h-80 overflow-y-auto">
                    <ion-item
                      v-for="member in teamMembers"
                      :key="member"
                      button
                      @click="toggleAssignee(member)"
                      class="px-4 min-h-14"
                      :class="{
                        'bg-blue-50': formData.assignee.includes(member),
                      }"
                    >
                      <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-3">
                          <ion-avatar class="w-8 h-8">
                            <img
                              :src="'https://i.pravatar.cc/40?u=' + member"
                              class="w-8 h-8 rounded-full"
                            />
                          </ion-avatar>
                          <ion-label class="text-sm text-gray-700">{{
                            member
                          }}</ion-label>
                        </div>
                        <span
                          v-if="formData.assignee.includes(member)"
                          class="text-blue-500 text-lg"
                        >
                          <ion-icon :icon="checkmarkCircle" />
                        </span>
                      </div>
                    </ion-item>
                  </ion-list>
                </ion-popover>
              </ClientOnly>
            </div>

            <!-- Due Date -->
            <div class="space-y-2">
              <label
                class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <ion-icon
                  :icon="calendarOutline"
                  class="text-base text-gray-500"
                />
                Due Date
                <span class="text-red-500">*</span>
              </label>
              <div class="space-y-1">
                <ion-datetime-button
                  datetime="dueDate"
                  class="justify-start! [&::part(native)]:bg-gray-50 [&::part(native)]:border [&::part(native)]:border-gray-300 [&::part(native)]:rounded-lg [&::part(native)]:px-3 [&::part(native)]:py-2.5 [&::part(native)]:text-sm [&::part(native)]:text-gray-700"
                ></ion-datetime-button>
                <ion-modal :keep-contents-mounted="true">
                  <ion-datetime
                    id="dueDate"
                    v-model="formData.dueDate"
                    presentation="date"
                    class="bg-white"
                    :min="new Date().toISOString()"
                  ></ion-datetime>
                </ion-modal>
                <div v-if="formData.dueDate" class="text-xs text-gray-500">
                  {{ formatDate(formData.dueDate) }}
                </div>
                <div
                  v-else
                  class="flex items-center gap-1 text-xs text-red-500"
                >
                  <ion-icon :icon="alertCircleOutline" class="text-sm" />
                  Due date is required
                </div>
              </div>
            </div>

            <!-- Label -->
            <div class="space-y-2">
              <label
                class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <ion-icon
                  :icon="pricetagOutline"
                  class="text-base text-gray-500"
                />
                Label
              </label>
              <div class="relative">
                <ion-select
                  v-model="formData.label"
                  interface="popover"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  <ion-select-option value="Feature">Feature</ion-select-option>
                  <ion-select-option value="Bug">Bug</ion-select-option>
                  <ion-select-option value="Issue">Issue</ion-select-option>
                  <ion-select-option value="Undefined"
                    >Undefined</ion-select-option
                  >
                </ion-select>
                <div
                  class="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 cursor-pointer transition-all duration-200 hover:border-gray-400"
                >
                  <span
                    :class="{
                      'text-green-600': formData.label === 'Feature',
                      'text-red-600': formData.label === 'Bug',
                      'text-amber-600': formData.label === 'Issue',
                      'text-gray-500': formData.label === 'Undefined',
                    }"
                  >
                    {{ formData.label || "Select label" }}
                  </span>
                  <ion-icon
                    :icon="chevronDownOutline"
                    class="text-base text-gray-500 transition-transform duration-200"
                  />
                </div>
              </div>
            </div>

            <!-- Priority -->
            <div class="space-y-2">
              <label
                class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <ion-icon :icon="flagOutline" class="text-base text-gray-500" />
                Priority
              </label>
              <div class="flex gap-2">
                <button
                  v-for="priority in ['Low', 'Medium', 'High']"
                  :key="priority"
                  @click="
                    formData.priority = priority as 'Low' | 'Medium' | 'High'
                  "
                  class="flex-1 px-3! py-2! text-sm border border-gray-300 rounded-lg! bg-gray-50 text-gray-600 transition-all duration-200 hover:bg-gray-100"
                  :class="{
                    'font-medium': formData.priority === priority,
                    'bg-green-100 border-green-200 text-green-700!':
                      formData.priority === priority && priority === 'Low',
                    'bg-amber-100! border-amber-200 text-amber-700!':
                      formData.priority === priority && priority === 'Medium',
                    'bg-red-100 border-red-200 text-red-700!':
                      formData.priority === priority && priority === 'High',
                  }"
                >
                  {{ priority }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-gray-900">Description</h3>
            <span
              class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
              >Optional</span
            >
          </div>
          <div class="space-y-2">
            <ion-textarea
              v-model="formData.description"
              placeholder="Describe what needs to be done..."
              class="[&::part(native)]:bg-gray-50 [&::part(native)]:border [&::part(native)]:border-gray-300 [&::part(native)]:rounded-lg [&::part(native)]:px-3 [&::part(native)]:py-2.5 [&::part(native)]:text-sm"
              :rows="4"
              auto-grow
            />
            <div class="flex justify-end">
              <span class="text-xs text-gray-400">
                {{ formData.description?.length || 0 }}/500
              </span>
            </div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-start gap-3 flex-1 flex-col">
              <h3 class="text-base font-semibold text-gray-900">Checklist</h3>
            </div>
            <span
              class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
              >Optional</span
            >
          </div>

          <div
            v-if="formData.checklist.length > 0"
            class="flex items-center gap-2 mb-3"
          >
            <div class="w-1/2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 transition-all duration-300"
                :style="{ width: `${checklistProgress}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-500 font-medium"
              >{{ checklistProgress }}%</span
            >
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, index) in formData.checklist"
              :key="item.id"
              class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200"
              :class="{ 'bg-green-50 border-green-200': item.done }"
            >
              <div class="flex items-center gap-3 flex-1">
                <ion-checkbox
                  v-model="item.done"
                  class="[--size:20px] [--background-checked:#10b981] [--border-color-checked:#10b981]"
                  :class="{ '[--checkmark-color:white]': item.done }"
                />
                <ion-input
                  v-model="item.text"
                  placeholder="Checklist item"
                  class="[&::part(native)]:bg-transparent [&::part(native)]:p-0 [&::part(native)]:text-sm flex-1"
                  :class="{ 'line-through text-gray-500': item.done }"
                />
              </div>
              <button
                @click="removeChecklistItem(index)"
                class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <ion-icon :icon="trashOutline" class="text-base" />
              </button>
            </div>

            <button
              @click="addChecklistItem"
              class="flex items-center gap-2 w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <ion-icon :icon="addOutline" class="text-base" />
              <span class="text-sm">Add Checklist Item</span>
            </button>
          </div>
        </div>

        <!-- Attachments -->
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-gray-900">Attachments</h3>
            <span
              class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
              >Optional</span
            >
          </div>
          <div class="space-y-3">
            <div class="space-y-2">
              <div
                v-for="(file, index) in formData.attachments"
                :key="index"
                class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-300 rounded-lg"
              >
                <div
                  class="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
                >
                  <ion-icon :icon="documentOutline" class="text-base" />
                </div>
                <div class="flex-1 min-w-0">
                  <span
                    class="text-sm font-medium text-gray-700 truncate block"
                    >{{ file }}</span
                  >
                  <span class="text-xs text-gray-400">1.2 MB</span>
                </div>
                <button
                  @click="removeAttachment(index)"
                  class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <ion-icon :icon="closeOutline" class="text-base" />
                </button>
              </div>
            </div>

            <button
              @click="triggerFileInput"
              class="flex items-center gap-2 w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 relative"
            >
              <ion-icon :icon="attachOutline" class="text-base" />
              <span class="text-sm">Add Files</span>
              <input
                type="file"
                multiple
                ref="fileInput"
                @change="handleFileUpload"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </button>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="bg-white border-t border-gray-200">
      <ion-toolbar class="bg-transparent">
        <div class="flex gap-3 px-4 py-3">
          <ion-button
            @click="$emit('request-close')"
            fill="outline"
            class="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </ion-button>
          <ion-button
            @click="handleSave"
            :disabled="!isFormValid"
            class="flex-[2] bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:bg-gray-300 disabled:text-gray-500"
            expand="block"
          >
            <ion-icon :icon="checkmarkOutline" slot="start" class="text-base" />
            {{ task ? "Update Task" : "Create Task" }}
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<style scoped>
/* Hanya menyisakan styling yang benar-benar diperlukan untuk Ionic components */
.custom-modal {
  --border-radius: 16px;
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* Custom styling untuk Ionic components yang tidak bisa di-handle oleh Tailwind */
:deep(.custom-textarea) {
  --background: #f8fafc;
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
}

:deep(.custom-datetime) {
  --background: white;
}

/* Animation untuk progress bar */
.progress-fill {
  transition: width 0.3s ease;
}

/* Custom scrollbar untuk modal content */
:deep(.modal-content::-webkit-scrollbar) {
  width: 6px;
}

:deep(.modal-content::-webkit-scrollbar-track) {
  background: #f1f5f9;
}

:deep(.modal-content::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 3px;
}

:deep(.modal-content::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}
</style>
