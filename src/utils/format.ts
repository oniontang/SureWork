/**
 * 格式化工具（金额统一以「分」为单位存储，展示时转「元」，规避浮点误差）
 */

/** 分 → ¥1,234 展示 */
export function formatCurrency(cents: number): string {
  const yuan = Math.round(cents) / 100;
  return `¥${yuan.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;
}

/** 分 → 带小数的元（对账场景） */
export function formatCurrencyPrecise(cents: number): string {
  const yuan = cents / 100;
  return `¥${yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** ISO 时间 → 09/16 14:20 */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${minute}`;
}

/** ISO 时间 → 09/16 */
export function formatDate(iso: string): string {
  return formatDateTime(iso).slice(0, 5);
}

/** 小时数 → 6天23小时 */
export function formatHoursToDays(hours: number): string {
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return days > 0 ? `${days}天${rest}小时` : `${rest}小时`;
}

/** 手机号打码：138****6688 */
export function maskPhone(phone: string): string {
  if (phone.length < 7) {
    return phone;
  }
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

/** 百分比展示 */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
