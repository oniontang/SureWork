import { ROLE } from '@/constants';

/** 角色类型 */
export type RoleType = (typeof ROLE)[keyof typeof ROLE];

/** 认证等级 */
export type CertLevelType = 'L0' | 'L1' | 'L2' | 'L3';

/** 用户基础信息 */
export interface IUserType {
  id: string;
  name: string;
  role: RoleType;
  avatarLetter: string;
  certLevel: CertLevelType;
  isRealNameVerified: boolean;
  creditScore: number;
}

/** 需求方档案 */
export interface IDemanderProfileType extends IUserType {
  orgName: string;
  orgIntro: string;
  maskedPhone: string;
  email: string;
}

/** 从业者档案 */
export interface IProviderProfileType extends IUserType {
  title: string;
  city: string;
  years: number;
  skillTags: string[];
  priceRange: string;
  completedCount: number;
  goodRate: number;
  repurchaseRate: number;
  avgResponseHours: number;
  lostArbitrationRate: number;
}

/** 作品集条目 */
export interface IPortfolioItemType {
  id: string;
  name: string;
  category: string;
  tone: string;
}

/** 认证材料条目 */
export interface ICertMaterialType {
  id: string;
  name: string;
  description: string;
  status: 'done' | 'pending' | 'in_progress';
}
