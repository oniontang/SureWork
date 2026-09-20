/** 资金流水类型 */
export type LedgerTypeType = 'escrow' | 'split' | 'refund' | 'withdraw' | 'tax';

/** 资金流水条目 */
export interface ILedgerItemType {
  id: string;
  type: LedgerTypeType;
  title: string;
  meta: string;
  /** 金额，单位：分（正数入账 / 负数出账） */
  amountCents: number;
  statusLabel: string;
  tone: 'success' | 'teal' | 'danger' | 'plain';
  createdAt: string;
}

/** 钱包概览 */
export interface IWalletOverviewType {
  /** 托管中 */
  escrowCents: number;
  /** 可提现（从业者）/ 本月支出（需求方） */
  mainCents: number;
  /** 次级指标 */
  secondaryCents: number;
  tertiaryCents: number;
}

/** 提现账户 */
export interface IWithdrawAccountType {
  bankName: string;
  maskedCardNo: string;
  holderName: string;
  isVerified: boolean;
}

/** 认证项 */
export interface ICertificationItemType {
  id: string;
  levelLabel: string;
  description: string;
  status: 'done' | 'pending' | 'in_progress';
  progressPercent: number | null;
}
