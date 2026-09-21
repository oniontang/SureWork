import { request } from '@/api/request';
import { MAX_CLARIFY_QUESTIONS } from '@/constants';
import type { IDemandDraftType } from '@/types/demand';
import type {
  IQuickRefineResultType,
  IClarifyQuestionType,
  IClarifyAnswerType,
  IDiagnosisItemType,
  IRefinePatchType,
  IRefineResultType,
} from '@/types/ai';

/**
 * AI 需求细化接口（Mock 实现）。
 * 真实项目：调用大模型做「诊断 + 澄清 + 生成补丁」，此处返回结构一致的静态结果，
 * 页面与组件无需改动即可切换。
 */

const DIAGNOSE_LATENCY_MS = 900;
const GENERATE_LATENCY_MS = 1400;
const QUICK_REFINE_LATENCY_MS = 1100;

function buildUnderstood(draft: IDemandDraftType): string[] {
  const lines = draft.description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);
  const items = lines.length > 0 ? lines : [draft.description.trim() || draft.title];
  return [...items, `预算 ${Math.round(draft.budgetCents / 100)} 元 · 周期 ${draft.cycleDays} 天`];
}

function buildDiagnosis(): IDiagnosisItemType[] {
  return [
    { dimension: 'goal', label: '目标', score: 78, verdict: '业务目的清楚，但没写「做成什么样算成功」' },
    { dimension: 'scene', label: '使用场景', score: 40, verdict: '未说明菜单在哪里被使用：门店立牌、小程序还是外卖平台' },
    { dimension: 'scope', label: '功能范围', score: 62, verdict: '交付物可枚举，但缺源文件格式与字体授权约定' },
    { dimension: 'priority', label: '优先级', score: 30, verdict: '未区分必须项与可延后项，从业者无法排期' },
    { dimension: 'acceptance', label: '验收标准', score: 15, verdict: '几乎没有可客观判定的通过条件，后期争议概率高' },
  ];
}

function buildQuestions(): IClarifyQuestionType[] {
  const list: IClarifyQuestionType[] = [
    {
      id: 'q-scene',
      dimension: 'scene',
      text: '这套菜单系统需要在哪些场景使用？',
      options: ['仅门店立式菜单', '门店 + 小程序电子菜单', '门店 + 外卖平台图', '全渠道（门店/小程序/外卖）'],
      allowCustom: true,
    },
    {
      id: 'q-priority',
      dimension: 'priority',
      text: '如果时间紧张，哪一项必须优先交付？',
      options: ['菜单系统（赶开业）', '主视觉（先定调）', '源文件与规范'],
      allowCustom: true,
    },
    {
      id: 'q-accept',
      dimension: 'acceptance',
      text: '你希望用什么方式判定「主视觉通过」？',
      options: ['新店空间实拍验证', '内部评审投票通过', '与既有 VI 规范一致性检查'],
      allowCustom: true,
    },
    {
      id: 'q-revision',
      dimension: 'scope',
      text: '每个里程碑允许几轮修改？（未约定最容易出现无限改稿纠纷）',
      options: ['1 轮', '2 轮', '3 轮'],
      allowCustom: false,
    },
  ];
  return list.slice(0, MAX_CLARIFY_QUESTIONS);
}

function buildPatches(answers: IClarifyAnswerType[]): IRefinePatchType[] {
  const answerOf = (questionId: string): string =>
    answers.find((item) => item.questionId === questionId)?.value ?? '';

  const scene = answerOf('q-scene') || '门店 + 小程序电子菜单';
  const priority = answerOf('q-priority') || '菜单系统（赶开业）';
  const accept = answerOf('q-accept') || '新店空间实拍验证';
  const revision = answerOf('q-revision') || '2 轮';

  return [
    {
      id: 'p-desc',
      field: 'description',
      op: 'replace',
      baseText: '现有描述缺少使用场景与优先级',
      suggestion: `背景：山野咖啡 3 家新店 11 月开业，需要统一视觉以支撑后续加盟招商。
目标：Logo 微调升级 + 主视觉 + 三店通用菜单系统。
使用场景：${scene}，客群以 25–35 岁通勤人群为主。
优先级：${priority}，其余项可延后至 11 月初。
参考资料：现有 VI 手册与新店空间照片已上传。`,
      reason: `依据你对澄清问题「使用场景」「优先级」的回答补全`,
      source: 'user-answer',
    },
    {
      id: 'p-acc-1',
      field: 'acceptance',
      op: 'add',
      baseText: '',
      suggestion: `主视觉通过${accept}，并出具 1 张效果对比图`,
      reason: '把主观的「好看」换成可客观判定的动作',
      source: 'user-answer',
    },
    {
      id: 'p-acc-2',
      field: 'acceptance',
      op: 'add',
      baseText: '',
      suggestion: '菜单系统覆盖早市/晚市两套价目，且预留会员活动位',
      reason: '依据使用场景推导出的必备内容，避免交付后追加',
      source: 'model',
    },
    {
      id: 'p-acc-3',
      field: 'acceptance',
      op: 'add',
      baseText: '',
      suggestion: `每个里程碑含 ${revision}修改，超出按 ¥150/轮 计费`,
      reason: `依据你对「修改轮数」的选择，防止无限改稿`,
      source: 'user-answer',
    },
    {
      id: 'p-del-1',
      field: 'deliverables',
      op: 'add',
      baseText: '',
      suggestion: '电子菜单适配图（小程序尺寸）',
      reason: '使用场景包含小程序，需配套尺寸稿',
      source: 'model',
    },
    {
      id: 'p-del-2',
      field: 'deliverables',
      op: 'add',
      baseText: '',
      suggestion: '字体授权清单',
      reason: '未约定授权会造成商用风险，从业者也需提前确认',
      source: 'platform-default',
    },
    {
      id: 'p-budget',
      field: 'budgetCents',
      op: 'replace',
      baseText: '¥6,800',
      suggestion: '¥7,800',
      value: 780000,
      reason: '新增电子菜单适配图与授权清单，按设计类指导价 ¥800–3,000/项 折算约 +¥1,000',
      source: 'model',
    },
  ];
}

/**
 * 快速细化：不追问，直接按平台默认约定把描述补全，并保留用户原文。
 * 幂等：已写过的段落不会重复追加，可反复点击。
 */
function composeQuickDescription(draft: IDemandDraftType): string {
  const base = draft.description.trim();
  const additions: string[] = [];

  if (!base.includes('使用场景')) {
    additions.push('使用场景：门店立式菜单与小程序电子菜单同步使用，客群以 25–35 岁通勤人群为主。');
  }
  if (!base.includes('优先级')) {
    additions.push('优先级：菜单系统为必须项（需赶在开业前上线），主视觉与源文件规范可适度延后。');
  }
  if (!base.includes('修改')) {
    additions.push('修改约定：每个里程碑含 2 轮修改，超出部分按 ¥150/轮 计费。');
  }
  if (!base.includes('交付格式')) {
    additions.push('交付格式：分层源文件（AI/PSD）+ PDF 印刷稿 + 字体授权清单。');
  }

  return additions.length > 0 ? [base, ...additions].join('\n') : base;
}

export function fetchQuickRefine(draft: IDemandDraftType): Promise<IQuickRefineResultType> {
  return request<IQuickRefineResultType>(() => {
    const description = composeQuickDescription(draft);
    const changes: string[] = [];

    if (description !== draft.description.trim()) {
      changes.push('补全使用场景、优先级、修改约定与交付格式');
    }
    if (!draft.acceptance.some((line) => line.includes('实拍'))) {
      changes.push('新增 3 条可客观判定的验收标准');
    }
    if (!draft.deliverables.includes('字体授权清单')) {
      changes.push('补充 2 项交付物（电子菜单适配图、字体授权清单）');
    }
    changes.push('预算未改动，如需按交付物重算请用「深度细化」');

    return {
      description,
      acceptance: draft.acceptance.some((line) => line.includes('实拍'))
        ? []
        : [
            '主视觉通过新店空间实拍验证，并出具 1 张效果对比图',
            '菜单系统覆盖早市/晚市两套价目，且预留会员活动位',
            '每个里程碑含 2 轮修改，超出按 ¥150/轮 计费',
          ],
      deliverables: draft.deliverables.includes('字体授权清单')
        ? []
        : ['电子菜单适配图（小程序尺寸）', '字体授权清单'],
      changes,
      qualityScore: 86,
    };
  }, QUICK_REFINE_LATENCY_MS);
}

/** 阶段一：解析回显 + 五维诊断 + 澄清问题 */
export function fetchRefineDiagnosis(draft: IDemandDraftType): Promise<IRefineResultType> {
  return request<IRefineResultType>(
    () => ({
      sessionId: `rs-${Date.now()}`,
      qualityScore: 42,
      understood: buildUnderstood(draft),
      diagnosis: buildDiagnosis(),
      questions: buildQuestions(),
      patches: [],
      budgetAdvice: null,
      risks: [],
    }),
    DIAGNOSE_LATENCY_MS,
  );
}

/** 阶段二：依据澄清答案生成可采纳的补丁 */
export function fetchRefinePatches(
  draft: IDemandDraftType,
  answers: IClarifyAnswerType[],
): Promise<IRefineResultType> {
  return request<IRefineResultType>(
    () => ({
      sessionId: `rs-${Date.now()}`,
      qualityScore: 86,
      understood: buildUnderstood(draft),
      diagnosis: buildDiagnosis(),
      questions: buildQuestions(),
      patches: buildPatches(answers),
      budgetAdvice: {
        minCents: 600000,
        maxCents: 800000,
        basis: '设计类指导价 ¥800–3,000/项 × 6 项交付物，并含 3 周排期人力成本',
      },
      risks: [
        '未约定修改轮数时，同类需求平均产生 4.2 轮返工',
        '未指定源文件格式，交付争议在纠纷中占比约 18%',
      ],
    }),
    GENERATE_LATENCY_MS,
  );
}
