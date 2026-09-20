import { request } from '@/api/request';
import { DEMANDER_STATS, ORDERS, PROVIDER_JOBS, PROVIDER_STATS } from '@/api/mocks';
import type { IStatItemType } from '@/types/common';
import type { IOrderType } from '@/types/order';

export function fetchDemanderOrders(): Promise<IOrderType[]> {
  return request(() => ORDERS);
}

export function fetchDemanderStats(): Promise<IStatItemType[]> {
  return request(() => DEMANDER_STATS, 220);
}

export function fetchProviderStats(): Promise<IStatItemType[]> {
  return request(() => PROVIDER_STATS, 220);
}

export function fetchProviderJobs(): Promise<IOrderType[]> {
  return request(() => PROVIDER_JOBS);
}

export function fetchOrderDetail(orderId: string): Promise<IOrderType> {
  return request(() => {
    const order = [...ORDERS, ...PROVIDER_JOBS].find((item) => item.id === orderId);
    if (!order) {
      throw new Error(`订单不存在：${orderId}`);
    }
    return order;
  });
}

/** 验收通过：触发支付宝预授权转支付 + 商家分账 */
export function acceptMilestone(orderId: string, milestoneId: string): Promise<{ releasedCents: number }> {
  return request(() => {
    const order = ORDERS.find((item) => item.id === orderId);
    const milestone = order?.milestones.find((item) => item.id === milestoneId);
    if (!order || !milestone) {
      throw new Error('订单或里程碑不存在');
    }
    return { releasedCents: milestone.amountCents };
  }, 700);
}

/** 驳回整改：必须附结构化整改要求，计入驳回次数（上限 3 次） */
export function rejectMilestone(
  orderId: string,
  milestoneId: string,
  reason: string,
): Promise<{ rejectCount: number }> {
  return request(() => {
    if (!reason.trim()) {
      throw new Error('驳回必须填写整改要求（仲裁依据）');
    }
    const order = ORDERS.find((item) => item.id === orderId);
    const milestone = order?.milestones.find((item) => item.id === milestoneId);
    return { rejectCount: (milestone?.rejectCount ?? 0) + 1 };
  }, 700);
}

/** 选定投标人 → 生成电子合同并引导托管付款 */
export function selectBidder(bidId: string): Promise<{ orderDraftId: string }> {
  return request(() => ({ orderDraftId: `draft-${bidId}` }), 600);
}
