import type { CATEGORIES } from '@/constants';

/** 品类取值 */
export type CategoryValue = (typeof CATEGORIES)[number]['value'];

/** 统一接口返回结构 */
export interface IApiResultType<T> {
  code: number;
  message: string;
  data: T;
}

/** 分页返回结构 */
export interface IPageResultType<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Toast 语义 */
export type ToastToneType = 'info' | 'success' | 'error';

/** 统计卡数据 */
export interface IStatItemType {
  id: string;
  label: string;
  value: string;
  hint: string;
  isHighlight?: boolean;
}
