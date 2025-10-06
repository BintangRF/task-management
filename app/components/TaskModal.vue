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
} from "ionicons/icons";
import { type Task } from "~/types/task";

interface Props {
  isOpen: boolean;
  task: Task | null;
  columnId: string;
}

interface Emits {
  (e: "close"): void;
  (e: "save", taskData: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const teamMembers = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"];
const fileInput = ref<HTMLInputElement>();

const coverFile = ref<File | null>(null);

const handleCoverFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    coverFile.value = target.files[0];
  }
};

const coverPreview = computed(() => {
  return coverFile.value
    ? (window.URL as any).createObjectURL(coverFile.value)
    : props.task?.coverImage;
});

const formData = ref<Omit<Task, "id" | "columnId" | "createdAt">>({
  title: "",
  description: "",
  assignee: "",
  dueDate: new Date().toISOString().split("T")[0] || "",
  label: "Feature",
  priority: "Medium",
  checklist: [],
  attachments: [],
});

const isFormValid = ref(false);

// Reset form when modal opens/closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        if (props.task) {
          // Edit mode - populate form with task data
          formData.value = {
            title: props.task.title,
            description: props.task.description,
            assignee: props.task.assignee,
            dueDate: props.task.dueDate ?? "",
            label: props.task.label,
            priority: props.task.priority || "Medium",
            checklist: [...props.task.checklist],
            attachments: [...props.task.attachments],
          };
        } else {
          // Create mode - reset form
          formData.value = {
            title: "",
            description: "",
            assignee: "",
            dueDate: new Date().toISOString().split("T")[0] || "",
            label: "Feature",
            priority: "Medium",
            checklist: [],
            attachments: [],
          };
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
    !!formData.value.title.trim() &&
    !!formData.value.assignee &&
    !!formData.value.dueDate;
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
    target.value = ""; // Reset input
  }
};

const removeAttachment = (index: number) => {
  formData.value.attachments.splice(index, 1);
};

const handleSave = () => {
  if (isFormValid.value) {
    emit("save", { ...formData.value, coverFile: coverFile.value });
  }
};
</script>

<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ task ? "Edit Task" : "Create Task" }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item>
          <ion-label>Cover Image</ion-label>
          <input type="file" accept="image/*" @change="handleCoverFileUpload" />
        </ion-item>
        <ion-item v-if="coverFile || task?.coverImage">
          <img
            :src="coverPreview"
            alt="Cover Image"
            style="max-width: 100%; max-height: 150px; margin-top: 8px"
          />
        </ion-item>

        <!-- Title -->
        <ion-item>
          <ion-input
            label="Title"
            label-placement="stacked"
            v-model="formData.title"
            placeholder="Enter task title"
          />
        </ion-item>

        <!-- Description -->
        <ion-item>
          <ion-textarea
            label="Description"
            label-placement="stacked"
            v-model="formData.description"
            placeholder="Enter task description"
            :rows="3"
          />
        </ion-item>

        <!-- Assignee -->
        <ion-item>
          <ion-select
            label="Assignee"
            label-placement="stacked"
            v-model="formData.assignee"
            placeholder="Select assignee"
          >
            <ion-select-option
              v-for="member in teamMembers"
              :key="member"
              :value="member"
            >
              {{ member }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Due Date -->
        <ion-item>
          <ion-datetime-button datetime="dueDate"></ion-datetime-button>
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime
              id="dueDate"
              v-model="formData.dueDate"
              presentation="date"
            ></ion-datetime>
          </ion-modal>
        </ion-item>

        <!-- Label -->
        <ion-item>
          <ion-select
            label="Label"
            label-placement="stacked"
            v-model="formData.label"
          >
            <ion-select-option value="Feature">Feature</ion-select-option>
            <ion-select-option value="Bug">Bug</ion-select-option>
            <ion-select-option value="Issue">Issue</ion-select-option>
            <ion-select-option value="Undefined">Undefined</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Priority -->
        <ion-item>
          <ion-select
            label="Priority"
            label-placement="stacked"
            v-model="formData.priority"
          >
            <ion-select-option value="Low">Low</ion-select-option>
            <ion-select-option value="Medium">Medium</ion-select-option>
            <ion-select-option value="High">High</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Checklist -->
        <ion-item>
          <ion-label>Checklist</ion-label>
        </ion-item>

        <ion-item v-for="(item, index) in formData.checklist" :key="item.id">
          <ion-checkbox slot="start" v-model="item.done" />
          <ion-input v-model="item.text" placeholder="Checklist item" />
          <ion-button
            slot="end"
            fill="clear"
            color="danger"
            @click="removeChecklistItem(index)"
          >
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-button expand="block" fill="outline" @click="addChecklistItem">
            <ion-icon :icon="addOutline" slot="start" />
            Add Checklist Item
          </ion-button>
        </ion-item>

        <!-- Attachments -->
        <ion-item>
          <ion-label>Attachments</ion-label>
          <input
            type="file"
            multiple
            ref="fileInput"
            @change="handleFileUpload"
            style="display: none"
          />
          <ion-button slot="end" fill="outline" @click="triggerFileInput">
            <ion-icon :icon="attachOutline" slot="start" />
            Add Files
          </ion-button>
        </ion-item>

        <ion-item v-for="(file, index) in formData.attachments" :key="index">
          <ion-icon :icon="documentOutline" slot="start" />
          <ion-label>{{ file }}</ion-label>
          <ion-button
            slot="end"
            fill="clear"
            color="danger"
            @click="removeAttachment(index)"
          >
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="primary">
          <ion-button @click="$emit('close')">Cancel</ion-button>
          <ion-button @click="handleSave" :disabled="!isFormValid">
            Save
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>
