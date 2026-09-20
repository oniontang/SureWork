/**
 * 高频事件节流与防抖（规范 §11）
 */

/** 防抖：等待 idleMs 内无新调用再执行 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  idleMs: number,
): ((...args: TArgs) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: TArgs): void => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...args), idleMs);
  };

  debounced.cancel = (): void => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

/** 节流：每 intervalMs 最多执行一次 */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  intervalMs: number,
): (...args: TArgs) => void {
  let lastCallAt = 0;

  return (...args: TArgs): void => {
    const now = Date.now();
    if (now - lastCallAt >= intervalMs) {
      lastCallAt = now;
      fn(...args);
    }
  };
}
