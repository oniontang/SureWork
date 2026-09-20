import { request } from '@/api/request';
import { RECOMMENDED_TALENTS } from '@/api/mocks';
import type { ITalentItemType } from '@/types/talent';

/**
 * 需求方侧人才推荐。
 * 真实项目由撮合服务按「品类 + 预算档 + 历史合作 + 信用分」召回排序，
 * 这里返回结构一致的静态数据。
 */
export function fetchRecommendedTalents(limit = 4): Promise<ITalentItemType[]> {
  return request(() => RECOMMENDED_TALENTS.slice(0, limit), 320);
}

/** 发起定向邀约派单 */
export function inviteTalent(talentId: string): Promise<{ invitationId: string }> {
  return request(() => {
    if (!RECOMMENDED_TALENTS.some((item) => item.id === talentId)) {
      throw new Error('推荐对象不存在或已下线');
    }
    return { invitationId: `iv-${Date.now()}` };
  }, 600);
}
