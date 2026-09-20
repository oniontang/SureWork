/** 推荐对象类型：独立从业者或团队 */
export type TalentKindType = 'opc' | 'team';

/** 优质 OPC / 团队推荐条目 */
export interface ITalentItemType {
  id: string;
  name: string;
  letter: string;
  avatarTone: string;
  kind: TalentKindType;
  /** 专业头衔，团队为能力组合描述 */
  title: string;
  /** 认证标识文案 */
  certLabel: string;
  creditScore: number;
  skillTags: string[];
  /** 报价区间展示文案 */
  priceLabel: string;
  completedCount: number;
  /** 好评率，0-1 */
  goodRate: number;
  /** 推荐理由（匹配依据，建立信任） */
  reason: string;
  /** 是否为历史合作过的复购对象 */
  isRepurchase: boolean;
}
