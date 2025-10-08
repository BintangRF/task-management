// ~/composables/useToast.ts
import { ref } from "vue";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const toasts = ref<Toast[]>([]);

function showToast(
  message: string,
  type: ToastType = "success",
  duration = 2500
) {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  toasts.value.push({ id, message, type });

  // Auto remove after duration
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
}

export function useToast() {
  return { toasts, showToast };
}
