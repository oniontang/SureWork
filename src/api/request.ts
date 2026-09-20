import { MOCK_LATENCY } from '@/constants';
import type { IApiResultType } from '@/types/common';

/**
 * Mock 请求层。
 * 真实项目中此处替换为 axios/fetch 封装（统一 baseURL、超时、错误码、CSRF token 注入）。
 * 当前用随机时延模拟网络，驱动页面的骨架屏与 loading 交互。
 */

const LATENCY_SPAN = MOCK_LATENCY.max - MOCK_LATENCY.min;

function randomLatency(): number {
  return MOCK_LATENCY.min + Math.random() * LATENCY_SPAN;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** 模拟一次带网络时延的接口调用 */
export async function request<T>(loader: () => T, latencyMs?: number): Promise<T> {
  const result: IApiResultType<T> = {
    code: 0,
    message: 'ok',
    data: loader(),
  };
  await delay(latencyMs ?? randomLatency());

  if (result.code !== 0) {
    throw new Error(result.message);
  }
  return result.data;
}
