/**
 * 本地存储封装。
 * 安全约束（规范 §12）：
 * 1. 敏感信息（Token、密钥、身份证等）禁止写入 localStorage；
 * 2. 此处仅存储「可公开的界面偏好」（如当前视角），且使用 sessionStorage 随会话失效。
 */

const STORAGE_PREFIX = 'surework.';

export const storage = {
  set(key: string, value: string): void {
    try {
      sessionStorage.setItem(STORAGE_PREFIX + key, value);
    } catch {
      // 隐私模式或沙箱环境禁用存储时静默降级为内存态
      memoryFallback.set(key, value);
    }
  },

  get(key: string): string | null {
    try {
      return sessionStorage.getItem(STORAGE_PREFIX + key) ?? memoryFallback.get(key) ?? null;
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  },
};

const memoryFallback = new Map<string, string>();
