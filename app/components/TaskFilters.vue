<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonButton,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from "@ionic/vue";
import { useTaskManager } from "~/composables/useTaskManager";

const { filterOptions, searchQuery } = useTaskManager();

const clearFilters = () => {
  filterOptions.value = {
    assignee: "",
    label: "",
    dueDate: "",
  };
  searchQuery.value = "";
};
</script>

<template>
  <ion-card>
    <ion-card-content>
      <div class="filters-container">
        <!-- Search -->
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search tasks..."
          class="search-bar"
        />

        <!-- Filters -->
        <ion-item>
          <ion-select
            label="Label"
            v-model="filterOptions.label"
            placeholder="All labels"
          >
            <ion-select-option value="">All Labels</ion-select-option>
            <ion-select-option value="Feature">Feature</ion-select-option>
            <ion-select-option value="Bug">Bug</ion-select-option>
            <ion-select-option value="Issue">Issue</ion-select-option>
            <ion-select-option value="Undefined">Undefined</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Clear Filters -->
        <ion-button fill="outline" color="medium" @click="clearFilters">
          Clear Filters
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<style scoped>
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-bar {
  padding: 0;
}
</style>
