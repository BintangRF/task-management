import mitt from "mitt";

export const coverImageBus = mitt<{
  updated: { taskId: string };
}>();
