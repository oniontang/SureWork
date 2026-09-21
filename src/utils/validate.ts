/**
 * 输入校验与 XSS 防护（规范 §12：过滤用户输入）
 */

/** HTML 特殊字符转义，用于任何需要渲染用户文本的路径 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 去除首尾空白并限制长度 */
export function normalizeText(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength);
}

/** 金额（元或分）是否为有限数且不小于下限 */
export function isValidAmount(value: number, min = 0): boolean {
  return Number.isFinite(value) && value >= min;
}

/** 手机号（中国大陆）格式校验 */
export function isValidPhoneNumber(input: string): boolean {
  return /^1[3-9]\d{9}$/.test(input);
}

/** 邮箱格式校验 */
export function isValidEmail(input: string): boolean {
  return /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(input);
}

/**
 * 联系方式外泄检测（防跳单风控）：
 * 检测连续手机号 / 微信号 / QQ 号形态
 */
export function containsContactLeak(input: string): boolean {
  const phonePattern = /1[3-9]\d{9}/;
  const wechatPattern = /(?:微信|wx|vx)[:：]?\s*[a-zA-Z][-_a-zA-Z0-9]{4,19}/i;
  const qqPattern = /(?:qq)[:：]?\s*\d{5,11}/i;
  return phonePattern.test(input) || wechatPattern.test(input) || qqPattern.test(input);
}
