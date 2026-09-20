/** 订单状态（与后端状态机保持一致） */
export type OrderStatusType =
  | 'created'
  | 'ongoing'
  | 'delivering'
  | 'accepting'
  | 'settled'
  | 'after_sale'
  | 'closed'
  | 'arbitrating'
  | 'cancelled';

/** 托管状态（与订单状态解耦） */
export type EscrowStatusType = 'unpaid' | 'frozen' | 'partial_released' | 'released' | 'refunded';

/** 里程碑状态 */
export type MilestoneStatusType = 'pending' | 'delivered' | 'accepted' | 'paid' | 'rejected';

/** 里程碑 */
export interface IMilestoneType {
  id: string;
  seq: number;
  title: string;
  /** 金额，单位：分 */
  amountCents: number;
  status: MilestoneStatusType;
  deliveredAt: string | null;
  acceptedAt: string | null;
  rejectCount: number;
  /** 自动验收倒计时剩余小时 */
  autoAcceptRemainHours: number | null;
  deliverableSummary: string;
}

/** 订单 */
export interface IOrderType {
  id: string;
  orderNo: string;
  demandTitle: string;
  counterpartyName: string;
  counterpartyLetter: string;
  counterpartyAvatarTone: string;
  counterpartyVerified: boolean;
  /** 订单总额，单位：分 */
  totalCents: number;
  /** 托管中，单位：分 */
  escrowCents: number;
  /** 已放款，单位：分 */
  releasedCents: number;
  status: OrderStatusType;
  escrowStatus: EscrowStatusType;
  progressPercent: number;
  contractNo: string;
  createdAt: string;
  milestones: IMilestoneType[];
}

/** 订单事件（留痕，仲裁证据链） */
export interface IOrderEventType {
  id: string;
  orderId: string;
  actor: string;
  action: string;
  createdAt: string;
}
