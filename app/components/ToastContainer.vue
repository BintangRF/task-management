<template>
  <div
    class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
  >
    <transition-group
      name="toast"
      tag="div"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 translate-y-2 scale-95 blur-sm"
      enter-to-class="opacity-100 translate-y-0 scale-100 blur-0"
      leave-from-class="opacity-100 translate-y-0 scale-100 blur-0"
      leave-to-class="opacity-0 translate-y-2 scale-95 blur-sm"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-80 px-5 py-4 bg-white border-l-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-gray-800 relative overflow-hidden"
        :class="toastAccent(toast.type)"
      >
        <div class="flex items-center gap-3">
          <div v-html="toastIcon(toast.type)" class="text-xl"></div>
          <div class="flex-1 text-sm font-medium tracking-wide leading-snug">
            {{ toast.message }}
          </div>
        </div>

        <button
          class="absolute top-4 right-3 text-gray-400 hover:text-gray-600 text-lg font-bold"
          @click="removeToast(toast.id)"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "~/composables/useToast";

const { toasts } = useToast();

const toastAccent = (type: string) => {
  switch (type) {
    case "success":
      return "border-emerald-500";
    case "error":
      return "border-rose-500";
    case "warning":
      return "border-amber-400";
    default:
      return "border-sky-500";
  }
};

const toastIcon = (type: string) => {
  switch (type) {
    case "success":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-5 h-5 text-emerald-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7' /></svg>`;
    case "error":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-5 h-5 text-rose-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12' /></svg>`;
    case "warning":
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-5 h-5 text-amber-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01M5.22 19h13.56L12 5.69 5.22 19z' /></svg>`;
    default:
      return `<svg xmlns='http://www.w3.org/2000/svg' class='w-5 h-5 text-sky-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>`;
  }
};

const removeToast = (id: string) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};
</script>

<style scoped>
.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
</style>
