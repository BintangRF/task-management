<script setup lang="ts">
import { ref } from "vue";
import {
  personAddOutline,
  funnelOutline,
  globeOutline,
  lockClosedOutline,
  chevronDownOutline,
} from "ionicons/icons";
import { IonSearchbar, IonButton, IonIcon, IonPopover } from "@ionic/vue";
import { useTaskManager } from "~/composables/useTaskManager";

const { filterOptions, searchQuery } = useTaskManager();

const teamMembers = ref([
  { avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
]);

const maxVisibleAvatars = 3;
const extraMembers =
  teamMembers.value.length - maxVisibleAvatars > 0
    ? teamMembers.value.length - maxVisibleAvatars
    : 0;

const isFilterOpen = ref(false);

const clearFilters = () => {
  filterOptions.value = {
    assignee: "",
    label: "",
    dueDate: "",
  };
  searchQuery.value = "";
  isFilterOpen.value = false;
};

const applyFilter = (label: string) => {
  filterOptions.value.label = label;
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
            @click="isFilterOpen = true"
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
          >
            <div class="bg-white rounded-xl shadow-xl p-4 w-48 md:w-60">
              <h3 class="font-semibold text-gray-800 mb-3">Filter by Label</h3>
              <div class="flex flex-col gap-2">
                <button
                  v-for="option in [
                    { value: '', label: 'All Labels' },
                    { value: 'Feature', label: 'Feature' },
                    { value: 'Bug', label: 'Bug' },
                    { value: 'Issue', label: 'Issue' },
                    { value: 'Undefined', label: 'Undefined' },
                  ]"
                  :key="option.value"
                  @click="applyFilter(option.value)"
                  class="w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-gray-100"
                  :class="{
                    'bg-blue-50 text-blue-600 font-medium':
                      filterOptions.label === option.value,
                    'text-gray-700': filterOptions.label !== option.value,
                  }"
                >
                  {{ option.label }}
                </button>
              </div>

              <div class="mt-3 pt-3 border-t border-gray-200">
                <button
                  @click="clearFilters"
                  class="w-full text-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
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
