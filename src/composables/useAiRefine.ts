import { computed, ref } from 'vue';

import { fetchRefineDiagnosis, fetchRefinePatches } from '@/api/ai';
import type { IDemandDraftType } from '@/types/demand';
import type {
  IClarifyAnswerType,
  IRefineApplyType,
  IRefinePatchType,
  IRefineResultType,
  RefineStepType,
} from '@/types/ai';

/**
 * AI 需求细化流程：诊断 → 澄清 → 生成补丁 → 逐条采纳 → 回填。
 * 面板只负责展示与选择，实际写入表单由调用方通过 apply 载荷完成，
 * 保证「AI 不直接覆盖用户内容」。
 */
export function useAiRefine(getDraft: () => IDemandDraftType) {
  const step = ref<RefineStepType>('diagnose');
  const isWorking = ref(false);
  const result = ref<IRefineResultType | null>(null);
  const answers = ref<Record<string, IClarifyAnswerType>>({});
  /** 补丁采纳状态：accepted / dismissed / 未处理 */
  const patchStates = ref<Record<string, 'accepted' | 'dismissed'>>({});

  const questions = computed(() => result.value?.questions ?? []);
  const patches = computed(() => result.value?.patches ?? []);
  const qualityScore = computed(() => result.value?.qualityScore ?? 0);

  const answeredCount = computed(() => Object.keys(answers.value).length);
  const canGenerate = computed(
    () => questions.value.length === 0 || answeredCount.value === questions.value.length,
  );
  const acceptedPatches = computed<IRefinePatchType[]>(() =>
    patches.value.filter((item) => patchStates.value[item.id] === 'accepted'),
  );
  const pendingCount = computed(
    () => patches.value.filter((item) => !patchStates.value[item.id]).length,
  );

  function answerOf(questionId: string): IClarifyAnswerType | undefined {
    return answers.value[questionId];
  }

  function setAnswer(questionId: string, value: string, isDefault = false): void {
    answers.value = { ...answers.value, [questionId]: { questionId, value, isDefault } };
  }

  async function start(): Promise<void> {
    isWorking.value = true;
    step.value = 'diagnose';
    try {
      result.value = await fetchRefineDiagnosis(getDraft());
    } finally {
      isWorking.value = false;
    }
  }

  async function generate(): Promise<void> {
    isWorking.value = true;
    try {
      const answerList = Object.values(answers.value);
      const next = await fetchRefinePatches(getDraft(), answerList);
      // 保留诊断阶段的分数用于对比
      result.value = { ...next, qualityScore: next.qualityScore };
      step.value = 'result';
    } finally {
      isWorking.value = false;
    }
  }

  function setPatchState(patchId: string, state: 'accepted' | 'dismissed'): void {
    patchStates.value = { ...patchStates.value, [patchId]: state };
  }

  function acceptAll(): void {
    const next: Record<string, 'accepted' | 'dismissed'> = { ...patchStates.value };
    patches.value.forEach((item) => {
      next[item.id] = 'accepted';
    });
    patchStates.value = next;
  }

  function undoAll(): void {
    patchStates.value = {};
  }

  /** 组装回填载荷：由调用方写入表单 */
  function buildApplyPayload(base: IDemandDraftType): IRefineApplyType {
    const draft: Partial<IDemandDraftType> = {};
    const deliverables = [...base.deliverables];
    const acceptance = [...base.acceptance];

    acceptedPatches.value.forEach((patch) => {
      if (patch.field === 'description') {
        draft.description = patch.suggestion;
      } else if (patch.field === 'budgetCents' && patch.value !== undefined) {
        draft.budgetCents = patch.value;
      } else if (patch.field === 'cycleDays' && patch.value !== undefined) {
        draft.cycleDays = patch.value;
      } else if (patch.field === 'deliverables' && !deliverables.includes(patch.suggestion)) {
        deliverables.push(patch.suggestion);
      } else if (patch.field === 'acceptance' && !acceptance.includes(patch.suggestion)) {
        acceptance.push(patch.suggestion);
      }
    });

    if (deliverables.length !== base.deliverables.length) {
      draft.deliverables = deliverables;
    }
    if (acceptance.length !== base.acceptance.length) {
      draft.acceptance = acceptance;
    }

    return {
      draft,
      qualityScore: result.value?.qualityScore ?? 0,
      acceptedCount: acceptedPatches.value.length,
    };
  }

  function reset(): void {
    step.value = 'diagnose';
    result.value = null;
    answers.value = {};
    patchStates.value = {};
  }

  return {
    step,
    isWorking,
    result,
    answers,
    questions,
    patches,
    qualityScore,
    answeredCount,
    canGenerate,
    acceptedPatches,
    pendingCount,
    patchStates,
    answerOf,
    setAnswer,
    start,
    generate,
    setPatchState,
    acceptAll,
    undoAll,
    buildApplyPayload,
    reset,
  };
}
