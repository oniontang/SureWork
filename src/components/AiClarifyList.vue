<script setup lang="ts">
import { reactive } from 'vue';

import type { IClarifyAnswerType, IClarifyQuestionType } from '@/types/ai';

interface IPropsType {
  questions: IClarifyQuestionType[];
  answers: Record<string, IClarifyAnswerType>;
}

const props = defineProps<IPropsType>();
const emit = defineEmits<{ answer: [questionId: string, value: string, isDefault?: boolean] }>();

/** 自定义输入框的临时值 */
const customs = reactive<Record<string, string>>({});

function pick(question: IClarifyQuestionType, option: string): void {
  emit('answer', question.id, option);
}

function useCustom(question: IClarifyQuestionType): void {
  const value = (customs[question.id] ?? '').trim();
  if (value) {
    emit('answer', question.id, value);
    customs[question.id] = '';
  }
}

function skipToDefault(question: IClarifyQuestionType): void {
  emit('answer', question.id, question.options[0], true);
}
</script>

<template>
  <div class="ai-clarify">
    <p class="ai-clarify__tip">
      回答后我会重写需求描述与验收标准；共 {{ props.questions.length }} 题，不确定可让我按平台建议填。
    </p>

    <section v-for="(question, index) in props.questions" :key="question.id" class="ai-question">
      <header class="ai-question__head">
        <span class="ai-question__idx">{{ index + 1 }}</span>
        <b>{{ question.text }}</b>
        <span
          v-if="props.answers[question.id]"
          :class="['tag', props.answers[question.id].isDefault ? 'tag--plain' : 'tag--success']"
        >
          {{ props.answers[question.id].isDefault ? '按建议' : '已回答' }}
        </span>
      </header>

      <div class="chip-row">
        <button
          v-for="option in question.options"
          :key="option"
          :class="['chip', { 'chip--on': props.answers[question.id]?.value === option }]"
          @click="pick(question, option)"
        >
          {{ option }}
        </button>
      </div>

      <div v-if="question.allowCustom" class="ai-question__custom">
        <input
          v-model="customs[question.id]"
          placeholder="补充说明（可选）"
          maxlength="80"
          @keydown.enter.prevent="useCustom(question)"
        />
        <button class="btn btn--ghost btn--sm" @click="useCustom(question)">填入</button>
      </div>

      <button class="ai-question__skip" @click="skipToDefault(question)">不确定，按平台建议填</button>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.ai-clarify {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.ai-clarify__tip {
  font-size: $fs-sm;
  color: $color-ink-3;
  line-height: 1.7;
}

.ai-question {
  padding: $space-4;
  border-radius: $radius-md;
  background: $color-panel;
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.ai-question__head {
  display: flex;
  align-items: center;
  gap: $space-3;

  b {
    font-size: $fs-base;
    line-height: 1.5;
    flex: 1;
  }
}

.ai-question__idx {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
  border-radius: 50%;
  background: $color-accent;
  color: $color-on-accent;
  font-size: 0.6875rem;
  font-weight: 800;
}

.ai-question__custom {
  display: flex;
  gap: $space-2;

  input {
    flex: 1;
    height: 2.125rem;
    padding: 0 $space-3;
    border-radius: $radius-sm;
    border: 0.0625rem solid $color-border;
    background: $color-surface;
    outline: none;

    &:focus {
      border-color: $color-accent;
    }
  }
}

.ai-question__skip {
  align-self: flex-start;
  font-size: $fs-xs;
  color: $color-ink-3;
  text-decoration: underline dotted;

  &:hover {
    color: $color-accent-deep;
  }
}
</style>
