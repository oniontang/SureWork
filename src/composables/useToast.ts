import { inject, provide } from 'vue';

import { useUiStore } from '@/store/ui';
import type { ToastToneType } from '@/types/common';

const TOAST_INJECTION_KEY = Symbol('toast');

export type ToastFn = (message: string, tone?: ToastToneType) => void;

/** 依赖注入：组件树内统一取用 toast */
export function provideToast(): ToastFn {
  const ui = useUiStore();
  const toast: ToastFn = (message, tone) => ui.pushToast(message, tone);
  provide(TOAST_INJECTION_KEY, toast);
  return toast;
}

export function useToast(): ToastFn {
  const toast = inject(TOAST_INJECTION_KEY, null);
  if (!toast) {
    const ui = useUiStore();
    return (message, tone) => ui.pushToast(message, tone);
  }
  return toast;
}
