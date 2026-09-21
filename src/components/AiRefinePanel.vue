<script setup lang="ts">
import { computed, watch } from 'vue';

import AiClarifyList from '@/components/AiClarifyList.vue';
import AiDiagnosisCard from '@/components/AiDiagnosisCard.vue';
import AiPatchItem from '@/components/AiPatchItem.vue';
import BaseModal from '@/components/BaseModal.vue';
import { QUALITY_SUBMIT_THRESHOLD } from '@/constants';
import { useAiRefine } from '@/composables/useAiRefine';
import { useToast } from '@/composables/useToast';
import type { IDemandDraftType } from '@/types/demand';
import type { IRefineApplyType } from '@/types/ai';

interface IPropsType {
  open: boolean;
  draft: IDemandDraftType;
}

const props = defineProps<IPropsType>();
const emit = defineEmits<{ 'update:open': [value: boolean]; apply: [payload: IRefineApplyType] }>();

const toast = useToast();
const {
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
  patchStates,
  setAnswer,
  start,
  generate,
  setPatchState,
  acceptAll,
  undoAll,
  buildApplyPayload,
  reset,
} = useAiRefine(() => props.draft);

/** 步骤条 */
const STEPS = [
  { key: 'diagnose', label: '解析诊断' },
  { key: 'clarify', label: '澄清追问' },
  { key: 'result', label: '逐条采纳' },
] as const;

const stepIndex = computed(() => STEPS.findIndex((item) => item.key === step.value));
const isPassing = computed(() => qualityScore.value >= QUALITY_SUBMIT_THRESHOLD);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      reset();
      void start();
    }
  },
);

function close(): void {
  emit('update:open', false);
}

function handleAnswer(questionId: string, value: string, isDefault = false): void {
  setAnswer(questionId, value, isDefault);
}

function handleEdit(patchId: string, value: string): void {
  const target = patches.value.find((item) => item.id === patchId);
  if (target) {
    target.suggestion = value;
    setPatchState(patchId, 'accepted');
  }
}

function handleApply(): void {
  if (acceptedPatches.value.length === 0) {
    toast('至少采纳 1 条建议后再应用', 'error');
    return;
  }
  emit('apply', buildApplyPayload(props.draft));
  close();
}
</script>

<template>
  <BaseModal :open="props.open" title="AI 需求细化" wide @close="close">
    <template v-if="result">
      <ol class="ai-steps">
        <li
          v-for="(item, index) in STEPS"
          :key="item.key"
          :class="['ai-steps__item', { 'ai-steps__item--on': index <= stepIndex }]"
        >
          <span class="ai-steps__idx">{{ index + 1 }}</span>{{ item.label }}
        </li>
        <li class="ai-steps__score" :class="{ 'ai-steps__score--pass': isPassing }">
          质量分 {{ qualityScore }}
        </li>
      </ol>

      <!-- 阶段一：解析回显 + 诊断 -->
      <div v-if="step === 'diagnose'" class="ai-panel__body">
        <AiDiagnosisCard
          :understood="result.understood"
          :diagnosis="result.diagnosis"
          :quality-score="qualityScore"
        />
        <div v-if="isWorking" class="skeleton ai-panel__loading" />
      </div>

      <!-- 阶段二：澄清追问 -->
      <div v-else-if="step === 'clarify'" class="ai-panel__body">
        <AiClarifyList :questions="questions" :answers="answers" @answer="handleAnswer" />
      </div>

      <!-- 阶段三：逐条采纳 -->
      <div v-else class="ai-panel__body">
        <p v-if="result.risks.length" class="ai-risks">
          <b>不细化可能的后果</b>
          <span v-for="risk in result.risks" :key="risk">· {{ risk }}</span>
        </p>

        <p v-if="result.budgetAdvice" class="ai-budget">
          <b>预算建议 {{ (result.budgetAdvice.minCents / 100).toLocaleString('zh-CN') }}–{{ (result.budgetAdvice.maxCents / 100).toLocaleString('zh-CN') }} 元</b>
          <span>{{ result.budgetAdvice.basis }}</span>
        </p>

        <div class="ai-patches">
          <AiPatchItem
            v-for="patch in patches"
            :key="patch.id"
            :patch="patch"
            :state="patchStates[patch.id]"
            @accept="setPatchState($event, patchStates[$event] === 'accepted' ? 'dismissed' : 'accepted')"
            @dismiss="setPatchState($event, 'dismissed')"
            @edit="handleEdit"
          />
        </div>

        <div v-if="isWorking" class="skeleton ai-panel__loading" />
      </div>
    </template>

    <div v-else class="skeleton ai-panel__loading" />

    <template #footer>
      <button v-if="step === 'diagnose'" class="btn btn--ghost" @click="close">稍后再说</button>
      <button v-if="step === 'clarify'" class="btn btn--ghost" @click="step = 'diagnose'">上一步</button>
      <button v-if="step === 'result'" class="btn btn--ghost" @click="undoAll">全部撤销</button>
      <button v-if="step === 'result'" class="btn btn--ghost" @click="acceptAll">全部采纳</button>

      <button
        v-if="step === 'diagnose'"
        class="btn btn--primary"
        :disabled="isWorking"
        @click="step = 'clarify'"
      >
        继续，回答 {{ questions.length }} 个澄清问题
      </button>
      <button
        v-else-if="step === 'clarify'"
        class="btn btn--primary"
        :disabled="!canGenerate || isWorking"
        @click="generate"
      >
        <span v-if="isWorking" class="spin" />
        {{ isWorking ? '生成中…' : `生成细化建议（${answeredCount}/${questions.length}）` }}
      </button>
      <button v-else class="btn btn--primary" @click="handleApply">
        应用已采纳的 {{ acceptedPatches.length }} 条
      </button>
    </template>
  </BaseModal>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.ai-steps {
  list-style: none;
  display: flex;
  align-items: center;
  gap: $space-4;
  padding-bottom: $space-4;
  margin-bottom: $space-4;
  border-bottom: 0.0625rem solid $color-border;
  font-size: $fs-sm;
}

.ai-steps__item {
  display: flex;
  align-items: center;
  gap: $space-2;
  color: $color-ink-3;

  &--on {
    color: $color-ink-1;
    font-weight: 700;
  }
}

.ai-steps__idx {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: $color-panel;
  color: $color-ink-3;
  font-size: 0.6875rem;
  font-weight: 800;
}

.ai-steps__item--on .ai-steps__idx {
  background: $color-accent;
  color: $color-on-accent;
}

.ai-steps__score {
  margin-left: auto;
  padding: 0.125rem $space-3;
  border-radius: $radius-pill;
  background: $color-danger-soft;
  color: $color-danger;
  font-weight: 700;
  font-size: $fs-xs;

  &--pass {
    background: $color-success-soft;
    color: $color-success;
  }
}

.ai-panel__body {
  min-height: 18rem;
}

.ai-panel__loading {
  height: 12rem;
  margin-top: $space-4;
}

.ai-risks,
.ai-budget {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  padding: $space-4;
  margin-bottom: $space-4;
  border-radius: $radius-md;
  font-size: $fs-sm;
  line-height: 1.7;
}

.ai-risks {
  background: $color-warning-soft;
  color: $color-warning;
}

.ai-budget {
  background: $color-teal-soft;
  color: $color-teal;

  span {
    font-size: $fs-xs;
    opacity: 0.9;
  }
}

.ai-patches {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}
</style>
