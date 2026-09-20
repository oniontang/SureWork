import type { CategoryValue } from '@/types/common';

/** 需求状态 */
export type DemandStatusType = 'open' | 'matching' | 'ordered' | 'closed';

/** 预算方式 */
export type BudgetModeType = 'fixed' | 'range';

/** 需求（企业发布的项目外包需求） */
export interface IDemandType {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  isEnterpriseVerified: boolean;
  category: CategoryValue;
  title: string;
  description: string;
  /** 金额单位：分 */
  budgetCents: number;
  budgetMode: BudgetModeType;
  budgetRangeLabel: string;
  cycleDays: number;
  acceptance: string[];
  deliverables: string[];
  requiresCertifiedOpc: boolean;
  bidCount: number;
  /** 需求详情页展示：被浏览次数 */
  viewCount?: number;
  /** 需求详情页展示：企业历史发布数 */
  enterpriseDemandCount?: number;
  /** 需求详情页展示：技能匹配要求 */
  requiredSkills?: string[];
  publishedAt: string;
  status: DemandStatusType;
}

/** 投标 */
export interface IBidType {
  id: string;
  demandId: string;
  opcId: string;
  opcName: string;
  avatarLetter: string;
  avatarTone: string;
  isCertified: boolean;
  creditScore: number;
  completedCount: number;
  goodRate: number;
  /** 报价，单位：分 */
  priceCents: number;
  scheduleLabel: string;
  proposal: string;
  highlightTags: string[];
  submittedAt: string;
}

/** 公告 */
export interface INoticeType {
  id: string;
  type: '升级' | '规则' | '活动';
  title: string;
  publishedAt: string;
}

/** 运营 Banner */
export interface IBannerType {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  periodLabel: string;
}
