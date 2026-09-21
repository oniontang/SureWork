import { request } from '@/api/request';
import { BANNERS, BIDS, DEMANDS, NOTICES } from '@/api/mocks';
import { DEMAND_PAGE_SIZE, MAX_BID_BUDGET_RATIO } from '@/constants';
import type { IPageResultType } from '@/types/common';
import type { IBannerType, IBidType, IDemandType, INoticeType } from '@/types/demand';

/** 需求池筛选参数（与后端查询参数一一对应） */
export interface IDemandQueryType {
  categories: string[];
  budget: string;
  cycle: string;
  gate: string;
  sort: string;
  page: number;
}

export function fetchDemandPage(query: IDemandQueryType): Promise<IPageResultType<IDemandType>> {
  const sorted = [...DEMANDS].sort((a, b) => {
    if (query.sort === 'budget-desc') {
      return b.budgetCents - a.budgetCents;
    }
    if (query.sort === 'bids-asc') {
      return a.bidCount - b.bidCount;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  const start = (query.page - 1) * DEMAND_PAGE_SIZE;
  const list = sorted.slice(start, start + DEMAND_PAGE_SIZE);

  return request(() => ({
    list,
    total: sorted.length,
    page: query.page,
    pageSize: DEMAND_PAGE_SIZE,
    hasMore: start + DEMAND_PAGE_SIZE < sorted.length,
  }));
}

export function fetchDemands(): Promise<IDemandType[]> {
  return request(() => DEMANDS);
}

/** 需求详情（从业者投标前查看完整需求、验收标准与企业画像） */
export function fetchDemandDetail(demandId: string): Promise<IDemandType> {
  return request(() => {
    const target = DEMANDS.find((item) => item.id === demandId);
    if (!target) {
      throw new Error('该需求已下架或不存在');
    }
    return target;
  });
}

export function fetchBidsByDemand(demandId: string): Promise<IBidType[]> {
  return request(() => BIDS.filter((bid) => bid.demandId === demandId));
}

export function fetchBanners(): Promise<IBannerType[]> {
  return request(() => BANNERS, 200);
}

export function fetchNotices(): Promise<INoticeType[]> {
  return request(() => NOTICES, 260);
}

/** 发布需求（真实项目会先过机审+人审） */
export function publishDemand(payload: { title: string; budgetCents: number }): Promise<{ demandId: string }> {
  return request(() => {
    if (!payload.title.trim()) {
      throw new Error('需求标题不能为空');
    }
    if (!Number.isFinite(payload.budgetCents) || payload.budgetCents <= 0) {
      throw new Error('预算金额无效，请填写大于 0 的预算');
    }
    return { demandId: `d-${Date.now()}` };
  }, 700);
}

/** 提交投标（每人限投 1 次） */
export function submitBid(demandId: string, priceCents: number): Promise<{ bidId: string }> {
  return request(() => {
    const target = DEMANDS.find((item) => item.id === demandId);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      throw new Error('报价金额无效，请填写大于 0 的报价');
    }
    if (target && priceCents > target.budgetCents * MAX_BID_BUDGET_RATIO) {
      throw new Error('报价超出需求预算上限，请核对后重新提交');
    }
    return { bidId: `b-${Date.now()}` };
  }, 700);
}
