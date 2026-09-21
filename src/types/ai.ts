/** AI 需求细化相关类型（诊断 / 澄清 / 补丁 / 会话结果） */

import type { IDemandDraftType } from '@/types/demand';

/** 诊断维度 */
export type RefineDimensionType = 'goal' | 'scene' | 'scope' | 'priority' | 'acceptance';

/** 细化流程步骤 */
export type RefineStepType = 'diagnose' | 'clarify' | 'result';

/** 可被补丁写入的表单字段 */
export type RefineFieldType = 'description' | 'acceptance' | 'deliverables' | 'budgetCents' | 'cycleDays';

/** 补丁动作 */
export type RefineOpType = 'add' | 'replace';

/** 单维诊断结果 */
export interface IDiagnosisItemType {
  dimension: RefineDimensionType;
  label: string;
  score: number;
  verdict: string;
}

/** 澄清问题 */
export interface IClarifyQuestionType {
  id: string;
  dimension: RefineDimensionType;
  text: string;
  options: string[];
  allowCustom: boolean;
}

/** 澄清答案 */
export interface IClarifyAnswerType {
  questionId: string;
  value: string;
  /** 用户跳过，按平台建议填充 */
  isDefault: boolean;
}

/** 细化补丁：一条建议对应一次字段写入 */
export interface IRefinePatchType {
  id: string;
  field: RefineFieldType;
  op: RefineOpType;
  baseText: string;
  suggestion: string;
  /** 生成依据，必须展示给用户 */
  reason: string;
  source: 'user-answer' | 'platform-default' | 'model';
  /** 数值型字段（预算/周期）使用的机器值 */
  value?: number;
}

/** 预算建议 */
export interface IBudgetAdviceType {
  minCents: number;
  maxCents: number;
  basis: string;
}

/** 一次细化会话的返回 */
export interface IRefineResultType {
  sessionId: string;
  qualityScore: number;
  /** AI 已理解的信息（解析回显） */
  understood: string[];
  diagnosis: IDiagnosisItemType[];
  questions: IClarifyQuestionType[];
  patches: IRefinePatchType[];
  budgetAdvice: IBudgetAdviceType | null;
  risks: string[];
}

/** 应用到表单的载荷 */
export interface IRefineApplyType {
  draft: Partial<IDemandDraftType>;
  qualityScore: number;
  acceptedCount: number;
}

/** 快速细化结果：直接回填原输入框的完善内容 */
export interface IQuickRefineResultType {
  /** 完善后的需求描述（保留用户原文，追加缺失段落） */
  description: string;
  /** 建议补充的验收标准条目 */
  acceptance: string[];
  /** 建议补充的交付物 */
  deliverables: string[];
  /** 本次做了哪些补全，用于结果条展示 */
  changes: string[];
  qualityScore: number;
}
