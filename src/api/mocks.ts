import type { IBannerType, IBidType, IDemandType, INoticeType } from '@/types/demand';
import type { ITalentItemType } from '@/types/talent';
import type { IMessageItemType, IConversationType } from '@/types/message';
import type { IOrderType } from '@/types/order';
import type { ILedgerItemType, IWalletOverviewType, IWithdrawAccountType, ICertificationItemType } from '@/types/payment';
import type { IDemanderProfileType, IProviderProfileType, IPortfolioItemType, ICertMaterialType } from '@/types/user';

/** Mock 数据集（结构与后端接口文档一一对应） */

export const DEMANDERS: Record<string, IDemanderProfileType> = {
  me: {
    id: 'u-ent-001',
    name: '唐总',
    role: 'demander',
    avatarLetter: '唐',
    certLevel: 'L2',
    isRealNameVerified: true,
    creditScore: 0,
    orgName: '山野咖啡品牌部',
    orgIntro: '山野咖啡，云南山地豆源精品咖啡品牌，现有 2 家门店、3 家新店 11 月开业。',
    maskedPhone: '138****6688',
    email: 'brand@shanye.coffee',
  },
};

export const PROVIDERS: Record<string, IProviderProfileType> = {
  me: {
    id: 'u-opc-001',
    name: '林一舟',
    role: 'provider',
    avatarLetter: '林',
    certLevel: 'L2',
    isRealNameVerified: true,
    creditScore: 912,
    title: '品牌视觉设计师 · 7 年',
    city: '杭州',
    years: 7,
    skillTags: ['品牌VI', '菜单/物料', '包装'],
    priceRange: '¥800 – ¥3,000 / 项',
    completedCount: 47,
    goodRate: 0.98,
    repurchaseRate: 0.41,
    avgResponseHours: 1.8,
    lostArbitrationRate: 0,
  },
};

export const PORTFOLIOS: IPortfolioItemType[] = [
  { id: 'pf-1', name: '山野咖啡 VI', category: '品牌全案 · 已完单 · 复购客户', tone: 'w1' },
  { id: 'pf-2', name: '拾光茶饮包装', category: '包装设计 · 已完单', tone: 'w2' },
  { id: 'pf-3', name: '面包节主视觉', category: '活动KV · 已完单', tone: 'w3' },
  { id: 'pf-4', name: '读库书店导视', category: '空间物料 · 已完单', tone: 'w4' },
  { id: 'pf-5', name: '铁馆健身海报', category: '系列海报 · 已完单', tone: 'w5' },
  { id: 'pf-6', name: '植研所瓶标', category: '包装插画 · 已完单', tone: 'w6' },
];

export const CERTIFICATIONS: ICertificationItemType[] = [
  { id: 'c-1', levelLabel: 'L1 实名认证', description: '身份证 + 人脸活体核验', status: 'done', progressPercent: null },
  { id: 'c-2', levelLabel: 'L2 认证 OPC', description: '作品集人工审核通过 · 技能证明抽查已完成', status: 'done', progressPercent: null },
  { id: 'c-3', levelLabel: 'L3 金牌 OPC', description: '还差 3 单完单 · 信用分与仲裁败诉率已达标', status: 'in_progress', progressPercent: 87 },
];

export const CERT_MATERIALS: ICertMaterialType[] = [
  { id: 'm-1', name: '身份证明', description: '身份证正反面 · 已加密存储，平台脱敏展示', status: 'done' },
  { id: 'm-2', name: '作品集', description: '14 件 · 全部通过人工审核', status: 'done' },
  { id: 'm-3', name: '技能/经历证明', description: '曾任职设计公司证明 · 从业资格证书', status: 'done' },
  { id: 'm-4', name: '个人作品原创承诺', description: '已签署 · 版权纠纷将影响信用分与结算', status: 'done' },
];

export const DEMANDS: IDemandType[] = [
  {
    id: 'd-1', enterpriseId: 'e-1', enterpriseName: '山野咖啡', isEnterpriseVerified: true,
    category: 'design', title: '山野咖啡 · 品牌视觉升级（新店开业）',
    description: 'Logo 升级 + 主视觉 + 三店通用菜单系统，需交付源文件与使用规范；验收标准已填写，附现有 VI 手册与空间照片。',
    budgetCents: 680000, budgetMode: 'range', budgetRangeLabel: '区间 ¥6,000–8,000',
    cycleDays: 21, acceptance: ['主视觉通过店内实拍验证', '菜单覆盖早/晚市两套价目', '源文件含分层工程与字体授权'],
    deliverables: ['源文件', '使用规范'], requiresCertifiedOpc: false, bidCount: 2,
    publishedAt: '2026-09-19T12:00:00+08:00', status: 'matching',
  },
  {
    id: 'd-2', enterpriseId: 'e-2', enterpriseName: '烘焙工作室', isEnterpriseVerified: false,
    category: 'design', title: '烘焙工作室 · 包装插画 6 款',
    description: '牛角包/司康/贝果等 6 个单品的包装主插画，手绘风格，需源文件与印刷三色稿。',
    budgetCents: 240000, budgetMode: 'fixed', budgetRangeLabel: '一口价',
    cycleDays: 10, acceptance: ['6 款插画风格统一', '提供印刷三色稿'],
    deliverables: ['源文件', '印刷文件'], requiresCertifiedOpc: false, bidCount: 4,
    publishedAt: '2026-09-19T09:00:00+08:00', status: 'matching',
  },
  {
    id: 'd-3', enterpriseId: 'e-3', enterpriseName: '咖啡品牌', isEnterpriseVerified: true,
    category: 'dev', title: '咖啡品牌 · 小程序商城前端开发',
    description: '商城小程序前端：商品/购物车/订单/会员积分，接口已就绪，按里程碑付款（30/40/30）。',
    budgetCents: 1350000, budgetMode: 'range', budgetRangeLabel: '区间 ¥12,000–15,000',
    cycleDays: 42, acceptance: ['页面还原设计稿', '联调通过', '源码与部署文档交付'],
    deliverables: ['源码', '部署文档'], requiresCertifiedOpc: false, bidCount: 1,
    publishedAt: '2026-09-18T15:00:00+08:00', status: 'matching',
  },
  {
    id: 'd-4', enterpriseId: 'e-4', enterpriseName: '连锁茶饮', isEnterpriseVerified: true,
    category: 'marketing', title: '连锁茶饮 · 全案年度代运营',
    description: '全案年度代运营：内容矩阵 + 投放陪跑，季度里程碑结算，要求有连锁餐饮案例。',
    budgetCents: 6000000, budgetMode: 'range', budgetRangeLabel: '区间价',
    cycleDays: 365, acceptance: ['季度 GMV 目标', '内容排期表', '月度复盘报告'],
    deliverables: ['运营报告'], requiresCertifiedOpc: true, bidCount: 3,
    publishedAt: '2026-09-16T11:00:00+08:00', status: 'matching',
  },
  {
    id: 'd-5', enterpriseId: 'e-5', enterpriseName: '连锁健身房', isEnterpriseVerified: false,
    category: 'video', title: '连锁健身房 · 开业季短视频 20 条',
    description: '开业季投放素材：口播+探店混剪，竖版为主，需出样片后批量生产，验收标准已填写。',
    budgetCents: 900000, budgetMode: 'fixed', budgetRangeLabel: '一口价',
    cycleDays: 28, acceptance: ['样片先行确认风格', '竖版 1080×1920', '每条 2 轮修改'],
    deliverables: ['成片', '脚本文档'], requiresCertifiedOpc: true, bidCount: 5,
    publishedAt: '2026-09-19T14:30:00+08:00', status: 'matching',
  },
  {
    id: 'd-6', enterpriseId: 'e-6', enterpriseName: '植研所', isEnterpriseVerified: false,
    category: 'consult', title: '植研所 · 品牌手册中译英',
    description: '品牌手册与产品目录中译英约 1.2 万字，要求有消费品牌经验，交付双语对照稿。',
    budgetCents: 350000, budgetMode: 'fixed', budgetRangeLabel: '一口价',
    cycleDays: 14, acceptance: ['术语一致性表', '双语对照稿'],
    deliverables: ['双语稿'], requiresCertifiedOpc: false, bidCount: 0,
    publishedAt: '2026-09-19T16:00:00+08:00', status: 'open',
  },
  {
    id: 'd-7', enterpriseId: 'e-7', enterpriseName: '茶饮空间', isEnterpriseVerified: true,
    category: 'design', title: '茶饮空间 · 门店导视系统设计',
    description: '3 家新店导视系统：门头/灯箱/室内指示，需配合现有 VI 规范输出施工文件。',
    budgetCents: 480000, budgetMode: 'fixed', budgetRangeLabel: '一口价',
    cycleDays: 20, acceptance: ['施工尺寸图', '材质工艺标注'],
    deliverables: ['源文件', '施工文件'], requiresCertifiedOpc: false, bidCount: 1,
    publishedAt: '2026-09-19T16:40:00+08:00', status: 'open',
  },
  {
    id: 'd-8', enterpriseId: 'e-8', enterpriseName: '植研所', isEnterpriseVerified: true,
    category: 'dev', title: '植研所 · 会员小程序后端接口',
    description: '会员/积分/券核销后端接口开发，Node 技术栈，接口文档已就绪，按里程碑付款。',
    budgetCents: 1600000, budgetMode: 'range', budgetRangeLabel: '区间 ¥15,000–18,000',
    cycleDays: 45, acceptance: ['接口联调通过', '压测报告', '源码交付'],
    deliverables: ['源码', '接口文档'], requiresCertifiedOpc: false, bidCount: 0,
    publishedAt: '2026-09-19T16:20:00+08:00', status: 'open',
  },
];

export const BIDS: IBidType[] = [
  {
    id: 'b-1', demandId: 'd-9', opcId: 'u-opc-002', opcName: '周小蔓', avatarLetter: '周', avatarTone: 'av-2',
    isCertified: true, creditScore: 938, completedCount: 62, goodRate: 0.99,
    priceCents: 560000, scheduleLabel: '排期 3 周',
    proposal: '脚本 3 天/批、粗剪 1 天/条、精剪含字幕+调色；先出 1 条样片再批量，节点对齐门店开业节奏。',
    highlightTags: ['可出样片', '2 次历史合作'], submittedAt: '2026-09-19T10:20:00+08:00',
  },
  {
    id: 'b-2', demandId: 'd-9', opcId: 'u-opc-003', opcName: '陈默', avatarLetter: '陈', avatarTone: 'av-3',
    isCertified: true, creditScore: 871, completedCount: 118, goodRate: 0.97,
    priceCents: 590000, scheduleLabel: '排期 2.5 周',
    proposal: '全套模板化生产，成片风格统一；附赠 3 条 15s 竖版切片，适合投流。',
    highlightTags: ['附赠切片'], submittedAt: '2026-09-19T09:10:00+08:00',
  },
  {
    id: 'b-3', demandId: 'd-9', opcId: 'u-opc-004', opcName: '吴优', avatarLetter: '吴', avatarTone: 'av-4',
    isCertified: false, creditScore: 802, completedCount: 19, goodRate: 1,
    priceCents: 420000, scheduleLabel: '排期 4 周',
    proposal: '性价比路线，单条 1 轮修改；无样片，可先做首条验收再继续。',
    highlightTags: [], submittedAt: '2026-09-18T20:40:00+08:00',
  },
];

export const ORDERS: IOrderType[] = [
  {
    id: 'o-1', orderNo: 'RW-2609-0187', demandTitle: '品牌视觉升级 · 主视觉+菜单系统',
    counterpartyName: '林一舟', counterpartyLetter: '林', counterpartyAvatarTone: 'av-1', counterpartyVerified: true,
    totalCents: 680000, escrowCents: 476000, releasedCents: 204000,
    status: 'accepting', escrowStatus: 'partial_released', progressPercent: 66,
    contractNo: 'CT-2609-0187', createdAt: '2026-09-01T10:00:00+08:00',
    milestones: [
      { id: 'ms-1', seq: 1, title: 'M1 品牌方向提案', amountCents: 204000, status: 'paid', deliveredAt: '2026-09-02T14:00:00+08:00', acceptedAt: '2026-09-02T18:00:00+08:00', rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '2 个品牌方向提案' },
      { id: 'ms-2', seq: 2, title: 'M2 主视觉 + 菜单系统', amountCents: 272000, status: 'delivered', deliveredAt: '2026-09-16T14:20:00+08:00', acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: 167, deliverableSummary: '6 个文件 · 预览含水印' },
      { id: 'ms-3', seq: 3, title: 'M3 全套源文件与使用规范', amountCents: 204000, status: 'pending', deliveredAt: null, acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '' },
    ],
  },
  {
    id: 'o-2', orderNo: 'RW-2609-0142', demandTitle: '小红书图文代运营 · 月度',
    counterpartyName: '周小蔓', counterpartyLetter: '周', counterpartyAvatarTone: 'av-2', counterpartyVerified: true,
    totalCents: 800000, escrowCents: 600000, releasedCents: 200000,
    status: 'ongoing', escrowStatus: 'partial_released', progressPercent: 25,
    contractNo: 'CT-2609-0142', createdAt: '2026-09-10T10:00:00+08:00',
    milestones: [
      { id: 'ms-4', seq: 1, title: 'M1 账号诊断与选题库', amountCents: 200000, status: 'paid', deliveredAt: '2026-09-12T10:00:00+08:00', acceptedAt: '2026-09-13T10:00:00+08:00', rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '诊断报告 + 60 条选题' },
      { id: 'ms-5', seq: 2, title: 'M2 首批图文 12 篇', amountCents: 200000, status: 'pending', deliveredAt: null, acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '' },
      { id: 'ms-6', seq: 3, title: 'M3 数据周报与迭代', amountCents: 200000, status: 'pending', deliveredAt: null, acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '' },
      { id: 'ms-7', seq: 4, title: 'M4 月度复盘', amountCents: 200000, status: 'pending', deliveredAt: null, acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '' },
    ],
  },
  {
    id: 'o-3', orderNo: 'RW-2608-0093', demandTitle: '门店菜单重设计',
    counterpartyName: '林一舟', counterpartyLetter: '林', counterpartyAvatarTone: 'av-1', counterpartyVerified: true,
    totalCents: 180000, escrowCents: 0, releasedCents: 180000,
    status: 'closed', escrowStatus: 'released', progressPercent: 100,
    contractNo: 'CT-2608-0093', createdAt: '2026-08-12T10:00:00+08:00',
    milestones: [
      { id: 'ms-8', seq: 1, title: 'M1 菜单重设计交付', amountCents: 180000, status: 'paid', deliveredAt: '2026-08-20T10:00:00+08:00', acceptedAt: '2026-08-22T10:00:00+08:00', rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '源文件 + 印刷稿' },
    ],
  },
  {
    id: 'o-4', orderNo: 'RW-2608-0071', demandTitle: '海报加急单',
    counterpartyName: '—', counterpartyLetter: '—', counterpartyAvatarTone: 'av-4', counterpartyVerified: false,
    totalCents: 120000, escrowCents: 0, releasedCents: 0,
    status: 'cancelled', escrowStatus: 'refunded', progressPercent: 0,
    contractNo: '—', createdAt: '2026-08-28T10:00:00+08:00',
    milestones: [
      { id: 'ms-9', seq: 1, title: 'M1 海报 3 款', amountCents: 120000, status: 'rejected', deliveredAt: null, acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '' },
    ],
  },
];

export const PROVIDER_JOBS: IOrderType[] = [
  ORDERS[0],
  {
    id: 'j-2', orderNo: 'RW-2609-0201', demandTitle: '烘焙工作室 · 包装插画 6 款',
    counterpartyName: '拾光烘焙', counterpartyLetter: '拾', counterpartyAvatarTone: 'av-3', counterpartyVerified: false,
    totalCents: 216000, escrowCents: 216000, releasedCents: 0,
    status: 'ongoing', escrowStatus: 'frozen', progressPercent: 8,
    contractNo: 'CT-2609-0201', createdAt: '2026-09-19T10:00:00+08:00',
    milestones: [
      { id: 'ms-10', seq: 1, title: 'M1 风格提案 3 案', amountCents: 64800, status: 'pending', deliveredAt: null, acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '' },
      { id: 'ms-11', seq: 2, title: 'M2 插画 6 款', amountCents: 108000, status: 'pending', deliveredAt: null, acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '' },
      { id: 'ms-12', seq: 3, title: 'M3 源文件与三色稿', amountCents: 43200, status: 'pending', deliveredAt: null, acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '' },
    ],
  },
  {
    id: 'j-3', orderNo: 'RW-2608-0119', demandTitle: '健身房 · 开业海报系列',
    counterpartyName: '铁馆健身', counterpartyLetter: '铁', counterpartyAvatarTone: 'av-4', counterpartyVerified: true,
    totalCents: 342000, escrowCents: 342000, releasedCents: 0,
    status: 'accepting', escrowStatus: 'frozen', progressPercent: 90,
    contractNo: 'CT-2608-0119', createdAt: '2026-08-25T10:00:00+08:00',
    milestones: [
      { id: 'ms-13', seq: 1, title: 'M1 主视觉', amountCents: 102600, status: 'paid', deliveredAt: '2026-08-28T10:00:00+08:00', acceptedAt: '2026-08-29T10:00:00+08:00', rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '3 案' },
      { id: 'ms-14', seq: 2, title: 'M2 系列延展', amountCents: 136800, status: 'paid', deliveredAt: '2026-09-05T10:00:00+08:00', acceptedAt: '2026-09-06T10:00:00+08:00', rejectCount: 0, autoAcceptRemainHours: null, deliverableSummary: '8 张' },
      { id: 'ms-15', seq: 3, title: 'M3 源文件', amountCents: 102600, status: 'delivered', deliveredAt: '2026-09-18T10:00:00+08:00', acceptedAt: null, rejectCount: 0, autoAcceptRemainHours: 120, deliverableSummary: '分层源文件' },
    ],
  },
];

export const DEMANDER_WALLET: { overview: IWalletOverviewType; ledger: ILedgerItemType[] } = {
  overview: { escrowCents: 680000, mainCents: 1240000, secondaryCents: 2360000, tertiaryCents: 120000 },
  ledger: [
    { id: 'l-1', type: 'split', title: '分账完成 · M1 提案验收', meta: '林一舟 ¥1,836 · 平台服务费 ¥204', amountCents: -204000, statusLabel: '已放款', tone: 'success', createdAt: '2026-09-16T14:20:00+08:00' },
    { id: 'l-2', type: 'escrow', title: '托管 · 小红书代运营 M1', meta: '周小蔓 · 4 里程碑 30/25/25/20', amountCents: -200000, statusLabel: '托管冻结', tone: 'teal', createdAt: '2026-09-10T10:02:00+08:00' },
    { id: 'l-3', type: 'escrow', title: '托管 · 品牌视觉升级全额', meta: '3 里程碑 30/40/30', amountCents: -680000, statusLabel: '托管冻结', tone: 'teal', createdAt: '2026-09-01T09:31:00+08:00' },
    { id: 'l-4', type: 'refund', title: '原路退款 · 海报加急单', meta: '从业者超时未确认 · 自动退回微信支付', amountCents: 120000, statusLabel: '已到账', tone: 'success', createdAt: '2026-08-28T17:45:00+08:00' },
  ],
};

export const PROVIDER_WALLET: { overview: IWalletOverviewType; ledger: ILedgerItemType[]; account: IWithdrawAccountType } = {
  overview: { escrowCents: 428400, mainCents: 1246000, secondaryCents: 4123000, tertiaryCents: 61200 },
  ledger: [
    { id: 'pl-1', type: 'split', title: '分账入账 · M1 提案', meta: '山野咖啡 · 含代征个税 ¥37', amountCents: 183600, statusLabel: '已到账', tone: 'success', createdAt: '2026-09-03T10:00:00+08:00' },
    { id: 'pl-2', type: 'withdraw', title: '提现成功', meta: '招商银行(6688) · T+1 到账', amountCents: -900000, statusLabel: '已到账', tone: 'plain', createdAt: '2026-09-05T09:00:00+08:00' },
    { id: 'pl-3', type: 'tax', title: '代征个税 · 8 月经营所得', meta: '灵活用工平台 · 凭证可下载', amountCents: -61200, statusLabel: '已完税', tone: 'teal', createdAt: '2026-09-02T09:00:00+08:00' },
    { id: 'pl-4', type: 'split', title: '分账入账 · M2 海报系列', meta: '铁馆健身 · 含代征个税 ¥68', amountCents: 342000, statusLabel: '已到账', tone: 'success', createdAt: '2026-08-30T10:00:00+08:00' },
  ],
  account: { bankName: '招商银行', maskedCardNo: '尾号 6688', holderName: '林一舟', isVerified: true },
};

export const CONVERSATIONS: IConversationType[] = [
  { id: 'cv-1', orderId: 'o-1', peerName: '林一舟', peerLetter: '林', peerAvatarTone: 'av-1', lastMessage: '[交付物] M2 主视觉+菜单系统', lastAt: '2026-09-19T14:20:00+08:00', unreadCount: 0 },
  { id: 'cv-2', orderId: 'o-2', peerName: '周小蔓', peerLetter: '周', peerAvatarTone: 'av-2', lastMessage: 'M1 图文初稿已上传，请查收', lastAt: '2026-09-19T11:03:00+08:00', unreadCount: 2 },
  { id: 'cv-3', orderId: '', peerName: '平台仲裁', peerLetter: '系', peerAvatarTone: 'av-3', lastMessage: '工单 #8817 已受理，1 个工作日内答复', lastAt: '2026-09-18T18:00:00+08:00', unreadCount: 0 },
];

export const MESSAGES: IMessageItemType[] = [
  { id: 'msg-1', conversationId: 'cv-1', sender: 'system', type: 'system', content: '订单已创建，聊天记录将作为履约与仲裁依据，请勿引导线下交易', createdAt: '2026-09-01T10:05:00+08:00' },
  { id: 'msg-2', conversationId: 'cv-1', sender: 'peer', type: 'demand-card', content: '需求卡 · 品牌视觉升级', meta: '¥6,800 · 3 里程碑 · 验收标准已确认', createdAt: '2026-09-01T10:06:00+08:00' },
  { id: 'msg-3', conversationId: 'cv-1', sender: 'peer', type: 'text', content: '菜单系统想突出「山地豆源」的故事线，第二屏可以放豆卡吗？', createdAt: '2026-09-08T15:20:00+08:00' },
  { id: 'msg-4', conversationId: 'cv-1', sender: 'me', type: 'text', content: '可以，我排进 M2。菜单会做早晚市两套价目，豆卡放第二屏左滑进入。', createdAt: '2026-09-08T15:31:00+08:00' },
  { id: 'msg-5', conversationId: 'cv-1', sender: 'me', type: 'deliverable-card', content: '交付物 · M2 主视觉+菜单系统', meta: '6 个文件 · 预览含水印', createdAt: '2026-09-16T14:20:00+08:00' },
  { id: 'msg-6', conversationId: 'cv-1', sender: 'system', type: 'system', content: 'M2 已交付 · 请在 7 日内完成验收，逾期自动视为通过并放款 ¥2,448（税前）', createdAt: '2026-09-16T14:21:00+08:00' },
];

export const NOTICES: INoticeType[] = [
  { id: 'n-1', type: '升级', title: '支付宝预授权托管通道升级，冻结期延长至 90 天', publishedAt: '2026-09-18T10:00:00+08:00' },
  { id: 'n-2', type: '规则', title: '仲裁公示页上线：裁决摘要脱敏后公开可查', publishedAt: '2026-09-15T10:00:00+08:00' },
  { id: 'n-3', type: '活动', title: '国庆交付高峰：9/28–10/8 自动验收时钟顺延', publishedAt: '2026-09-12T10:00:00+08:00' },
];

export const BANNERS: IBannerType[] = [
  {
    id: 'bn-1', eyebrow: '第 3 期 · 创作者成长计划', title: '认证 OPC，前 3 单免平台服务费',
    description: '完成 L2 认证即享：优先派单池、曝光加权与新单佣金减免。信用分越高，接到的单越稳。',
    actionLabel: '立即认证', periodLabel: '09.20 – 10.31',
  },
  {
    id: 'bn-2', eyebrow: '企业首单礼', title: '首笔托管订单，服务费 5 折',
    description: '新认证企业首笔托管项目，平台服务费半价；里程碑验收不满意，托管资金全额退回。',
    actionLabel: '发布首个需求', periodLabel: '长期有效',
  },
];

/** 需求方工作台统计 */
export const DEMANDER_STATS = [
  { id: 's-1', label: '进行中订单', value: '2', hint: '1 个里程碑待你验收', isHighlight: true },
  { id: 's-2', label: '托管中资金', value: '¥6,800', hint: '持牌机构托管 · 验收后放款' },
  { id: 's-3', label: '本月支出', value: '¥12,400', hint: '较上月 +18%' },
  { id: 's-4', label: '待处理', value: '3', hint: '验收 1 · 投标筛选 1 · 合同 1' },
];

/** 从业者收入统计 */
export const PROVIDER_STATS = [
  { id: 'ps-1', label: '本月已结算', value: '¥18,200', hint: '已扣服务费 · 个税已代征', isHighlight: true },
  { id: 'ps-2', label: '托管中', value: '¥4,284', hint: '2 单 · 验收后 T+0 分账' },
  { id: 'ps-3', label: '待交付里程碑', value: '2', hint: '最近截止 09/24' },
];

/** 优质 OPC / 团队推荐（需求方侧人才位） */
export const RECOMMENDED_TALENTS: ITalentItemType[] = [
  {
    id: 't-1', name: '林一舟', letter: '林', avatarTone: 'av-1', kind: 'opc',
    title: '品牌视觉设计师 · 7 年', certLabel: '认证OPC · L2', creditScore: 912,
    skillTags: ['品牌VI', '菜单/物料', '包装'], priceLabel: '¥800–3,000/项',
    completedCount: 47, goodRate: 0.98,
    reason: '与你合作 3 次，本月还有 2 席档期，可直接定向邀约',
    isRepurchase: true,
  },
  {
    id: 't-2', name: '周小蔓', letter: '周', avatarTone: 'av-2', kind: 'opc',
    title: '短视频剪辑与内容运营 · 4 年', certLabel: '认证OPC · L2', creditScore: 938,
    skillTags: ['短视频', '脚本', '小红书'], priceLabel: '¥300–600/条',
    completedCount: 62, goodRate: 0.99,
    reason: '正在承接你的小红书代运营，开业季素材可一并排期',
    isRepurchase: true,
  },
  {
    id: 't-3', name: '拾光视觉工作室', letter: '拾', avatarTone: 'av-3', kind: 'team',
    title: '设计 + 开发 + 内容 三人小队', certLabel: '认证团队 · L2', creditScore: 956,
    skillTags: ['全案设计', '小程序', '品牌物料'], priceLabel: '¥1.2万起/项目',
    completedCount: 128, goodRate: 0.97,
    reason: '适合多店同步开业：视觉、菜单、线上一站承接，单一接口人对接',
    isRepurchase: false,
  },
  {
    id: 't-4', name: '陈默', letter: '陈', avatarTone: 'av-4', kind: 'opc',
    title: '剪辑 + 包装 · 6 年', certLabel: '认证OPC · L2', creditScore: 871,
    skillTags: ['剪辑包装', '投流素材', '动效'], priceLabel: '¥400–800/条',
    completedCount: 118, goodRate: 0.97,
    reason: '模板化产能高，同期已完成 3 个咖啡品牌开业季项目',
    isRepurchase: false,
  },
];
