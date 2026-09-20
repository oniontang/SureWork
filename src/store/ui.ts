import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ToastToneType } from '@/types/common';

export interface IToastItemType {
  id: number;
  message: string;
  tone: ToastToneType;
}

const TOAST_DURATION_MS = 2400;

/** 全局提示队列 */
export const useUiStore = defineStore('ui', () => {
  const toasts = ref<IToastItemType[]>([]);
  let seed = 0;

  function pushToast(message: string, tone: ToastToneType = 'info'): void {
    seed += 1;
    const toast: IToastItemType = { id: seed, message, tone };
    toasts.value = [...toasts.value, toast];
    setTimeout(() => {
      toasts.value = toasts.value.filter((item) => item.id !== toast.id);
    }, TOAST_DURATION_MS);
  }

  return { toasts, pushToast };
});
