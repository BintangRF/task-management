<script setup lang="ts">
import { ref } from "vue";
import {
  personAddOutline,
  funnelOutline,
  globeOutline,
  lockClosedOutline,
  chevronDownOutline,
  calendarOutline,
  personOutline,
  pricetagOutline,
} from "ionicons/icons";
import {
  IonSearchbar,
  IonButton,
  IonIcon,
  IonPopover,
  IonInput,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from "@ionic/vue";
import { useTaskManager } from "~/composables/useTaskManager";

const { filterOptions, searchQuery } = useTaskManager();

const teamMembers = ref([
  { name: "Andi", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { name: "Siti", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { name: "Budi", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { name: "Rina", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
]);

const maxVisibleAvatars = 3;
const extraMembers =
  teamMembers.value.length - maxVisibleAvatars > 0
    ? teamMembers.value.length - maxVisibleAvatars
    : 0;

const isFilterOpen = ref(false);

const tempFilter = ref({
  label: "",
  dueDate: "",
  assignee: "",
});

const openFilter = () => {
  tempFilter.value = { ...filterOptions.value };
  isFilterOpen.value = true;
};

const clearFilters = () => {
  filterOptions.value = {
    assignee: "",
    label: "",
    dueDate: "",
  };
  searchQuery.value = "";
  isFilterOpen.value = false;
};

const applyFilter = () => {
  filterOptions.value = { ...tempFilter.value };
  isFilterOpen.value = false;
};
</script>

<template>
  <ion-header>
    <ion-toolbar class="bg-white shadow-md ion-no-padding">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center w-full px-4 md:px-8 gap-3 md:gap-0 py-2"
      >
        <!-- Bagian Kiri -->
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <!-- Logo Dropdown -->
          <div
            class="flex items-center gap-1 cursor-pointer bg-gray-100 px-3 py-1 rounded-md"
          >
            <ion-icon :icon="lockClosedOutline" class="text-gray-600" />
            <span class="text-gray-800 font-semibold text-sm md:text-base"
              >Adhivasindo</span
            >
            <ion-icon :icon="chevronDownOutline" class="text-gray-600" />
          </div>

          <!-- Avatar Tim -->
          <div class="flex items-center -space-x-3">
            <img
              v-for="(member, index) in teamMembers.slice(0, maxVisibleAvatars)"
              :key="index"
              :src="member.avatar"
              alt="Avatar"
              class="h-7 w-7 md:h-8 md:w-8 rounded-full border-2 border-white"
            />
            <span
              v-if="extraMembers > 0"
              class="h-7 w-7 md:h-8 md:w-8 flex items-center justify-center bg-blue-400 rounded-full text-xs md:text-sm font-medium text-white border-2 border-white"
            >
              +{{ extraMembers }}
            </span>
          </div>

          <!-- Invite Button -->
          <ion-button
            size="small"
            color="light"
            class="flex items-center gap-1"
            style="--box-shadow: none"
          >
            <ion-icon :icon="personAddOutline" />
            <span class="hidden sm:inline">Invite</span>
          </ion-button>
        </div>

        <!-- Bagian Kanan -->
        <div
          class="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 w-full md:w-auto"
        >
          <!-- Filter Button -->
          <ion-button
            id="filter-trigger"
            size="small"
            color="light"
            class="flex items-center gap-1"
            style="--box-shadow: none"
            @click="openFilter"
          >
            <ion-icon :icon="funnelOutline" />
            <span class="hidden sm:inline">Filter</span>
            <ion-icon :icon="chevronDownOutline" class="text-gray-600 ml-1" />
          </ion-button>

          <!-- Popover Filter -->
          <ion-popover
            trigger="filter-trigger"
            :is-open="isFilterOpen"
            @didDismiss="isFilterOpen = false"
            class="p-0"
            style="--width: 90vw; --max-width: 400px"
            :keep-contents-mounted="true"
          >
            <div class="bg-white rounded-2xl p-5 space-y-4 text-sm">
              <h3
                class="font-semibold text-gray-900 text-base mb-2 flex items-center gap-2"
              >
                <ion-icon :icon="funnelOutline" class="text-primary" />
                Filter Tasks
              </h3>

              <!-- Label Input -->
              <div class="space-y-1">
                <label
                  class="text-xs font-medium text-gray-500 flex items-center gap-1"
                >
                  <ion-icon
                    :icon="pricetagOutline"
                    class="text-gray-500 text-sm"
                  />
                  Label
                </label>
                <ion-input
                  v-model="tempFilter.label"
                  placeholder="Feature, Bug, Issue"
                  class="rounded-lg border border-gray-200 text-sm py-1.5 px-2"
                />
              </div>

              <!-- Due Date Input -->
              <div class="space-y-1">
                <label
                  class="text-xs font-medium text-gray-500 flex items-center gap-1"
                >
                  <ion-icon
                    :icon="calendarOutline"
                    class="text-gray-500 text-sm"
                  />
                  Due Date
                </label>

                <!-- Modal untuk datetime -->
                <ion-datetime
                  v-model="tempFilter.dueDate"
                  presentation="date"
                  class="bg-white"
                ></ion-datetime>
              </div>

              <!-- Assignee Input -->
              <div class="space-y-1">
                <label
                  class="text-xs font-medium text-gray-500 flex items-center gap-1"
                >
                  <ion-icon
                    :icon="personOutline"
                    class="text-gray-500 text-sm"
                  />
                  Assignee
                </label>
                <ion-input
                  v-model="tempFilter.assignee"
                  placeholder="Type name"
                  class="rounded-lg border border-gray-200 text-sm py-1.5 px-2"
                />
              </div>

              <!-- Tombol Aksi -->
              <div
                class="flex justify-between gap-2 pt-4 border-t border-gray-200 mt-4"
              >
                <ion-button
                  expand="block"
                  fill="clear"
                  color="medium"
                  @click="clearFilters"
                  class="w-1/2 font-medium"
                >
                  Clear
                </ion-button>
                <ion-button
                  expand="block"
                  color="primary"
                  @click="applyFilter"
                  class="w-1/2 font-medium"
                >
                  Apply
                </ion-button>
              </div>
            </div>
          </ion-popover>

          <!-- Export/Import -->
          <ion-button
            size="small"
            fill="clear"
            color="medium"
            class="flex items-center gap-1 text-nowrap"
          >
            <ion-icon :icon="globeOutline" />
            <span class="hidden sm:inline">Export/Import</span>
          </ion-button>

          <!-- Searchbar -->
          <ion-searchbar
            v-model="searchQuery"
            color="light"
            placeholder="Search..."
            class="flex-1 min-w-[140px] md:min-w-[200px]"
            style="--box-shadow: none"
          />
        </div>
      </div>
    </ion-toolbar>
  </ion-header>
</template>
