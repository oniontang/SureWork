/**
 * 全局常量（规范 §5：禁止魔法数字，统一抽为常量）
 */

/** 用户角色 */
export const ROLE = {
  DEMANDER: 'demander',
  PROVIDER: 'provider',
} as const;

/** 平台服务费率（10%） */
export const COMMISSION_RATE = 0.1;

/** 里程碑默认拆分比例（30% / 40% / 30%） */
export const MILESTONE_SPLIT = [0.3, 0.4, 0.3] as const;

/** 强制拆分里程碑的金额门槛（分） */
export const MILESTONE_REQUIRED_THRESHOLD_CENTS = 300_000;

/** 自动验收时钟：交付后 7×24 小时未处理视为通过 */
export const AUTO_ACCEPT_HOURS = 168;

/** 里程碑驳回次数上限 */
export const MAX_REJECT_COUNT = 3;

/** 结算后售后窗口天数 */
export const AFTER_SALE_DAYS = 14;

/** 仲裁 SLA（工作日） */
export const ARBITRATION_SLA_DAYS = 5;

/** 单用户投标次数上限（每个需求） */
export const BID_LIMIT_PER_DEMAND = 1;

/** 投标报价相对需求预算的允许上浮比例（防恶意抬价） */
export const MAX_BID_BUDGET_RATIO = 1.2;

/** 大厅分页每页条数 */
export const DEMAND_PAGE_SIZE = 6;

/** 骨架屏模拟时延区间（毫秒） */
export const MOCK_LATENCY = { min: 420, max: 780 } as const;

/** 需求品类 */
export const CATEGORIES = [
  { value: 'design', label: '设计' },
  { value: 'video', label: '内容剪辑' },
  { value: 'dev', label: '开发' },
  { value: 'marketing', label: '营销投放' },
  { value: 'consult', label: '咨询/翻译' },
] as const;

/** 预算筛选档位（单位：分） */
export const BUDGET_FILTERS = [
  { value: 'all', label: '不限', min: 0, max: Number.POSITIVE_INFINITY },
  { value: 'low', label: '≤ ¥3k', min: 0, max: 300_000 },
  { value: 'mid', label: '¥3k – 10k', min: 300_001, max: 1_000_000 },
  { value: 'high', label: '¥10k 以上', min: 1_000_001, max: Number.POSITIVE_INFINITY },
] as const;

/** 周期筛选档位（单位：天） */
export const CYCLE_FILTERS = [
  { value: 'all', label: '不限', maxDays: Number.POSITIVE_INFINITY },
  { value: 'short', label: '≤ 2 周', maxDays: 14 },
  { value: 'month', label: '≤ 1 个月', maxDays: 31 },
] as const;

/** 门槛筛选 */
export const GATE_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'enterprise', label: '已认证企业发布' },
  { value: 'unlockable', label: '可解锁的高预算单' },
] as const;

/** 排序方式 */
export const SORT_OPTIONS = [
  { value: 'newest', label: '最新发布' },
  { value: 'budget-desc', label: '预算最高' },
  { value: 'bids-asc', label: '投标最少' },
] as const;

/** 订单状态文案与语义色 */
export const ORDER_STATUS_TEXT: Record<string, { label: string; tone: string }> = {
  ongoing: { label: '进行中', tone: 'teal' },
  accepting: { label: '待验收', tone: 'warning' },
  settling: { label: '待放款', tone: 'accent' },
  settled: { label: '已完成', tone: 'success' },
  arbitrating: { label: '仲裁中', tone: 'danger' },
  matching: { label: '选人中', tone: 'accent' },
} as const;

/** 认证等级 */
export const CERT_LEVELS = {
  L0: '实名注册',
  L1: '实名认证',
  L2: '认证 OPC / 认证企业',
  L3: '金牌 OPC',
} as const;
