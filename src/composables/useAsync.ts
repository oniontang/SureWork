import { readonly, ref } from 'vue';

/**
 * 异步任务 + 加载态封装：
 * 统一提供 isLoading（骨架屏）/ isSubmitting（按钮 loading）/ error。
 */
export function useAsync() {
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  /** 页面数据加载：默认走骨架屏 */
  async function run<T>(
    task: () => Promise<T>,
    options: { skeleton?: boolean } = {},
  ): Promise<T | null> {
    isLoading.value = options.skeleton ?? true;
    error.value = null;
    try {
      return await task();
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : '请求失败，请稍后重试';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /** 提交类动作：走按钮 loading，不触发骨架屏 */
  async function runAction(task: () => Promise<unknown>): Promise<boolean> {
    isSubmitting.value = true;
    error.value = null;
    try {
      await task();
      return true;
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : '操作失败，请稍后重试';
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isLoading: readonly(isLoading),
    isSubmitting: readonly(isSubmitting),
    error: readonly(error),
    run,
    runAction,
  };
}
