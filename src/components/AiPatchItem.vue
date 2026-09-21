<script setup lang="ts">
import { ref } from 'vue';

import type { IRefinePatchType } from '@/types/ai';

interface IPropsType {
  patch: IRefinePatchType;
  state?: 'accepted' | 'dismissed';
}

const props = withDefaults(defineProps<IPropsType>(), { state: undefined });
const emit = defineEmits<{
  accept: [patchId: string];
  dismiss: [patchId: string];
  edit: [patchId: string, value: string];
}>();

const FIELD_LABEL: Record<string, string> = {
  description: '需求描述',
  acceptance: '验收标准',
  deliverables: '交付物',
  budgetCents: '预算',
  cycleDays: '周期',
};

const SOURCE_LABEL: Record<string, string> = {
  'user-answer': '依据你的回答',
  'platform-default': '平台建议',
  model: 'AI 推断',
};

const isEditing = ref(false);
const edited = ref(props.patch.suggestion);

function confirmEdit(): void {
  const value = edited.value.trim();
  if (!value) {
    return;
  }
  emit('edit', props.patch.id, value);
  isEditing.value = false;
}
</script>

<template>
  <article :class="['ai-patch', `ai-patch--${state ?? 'pending'}`]">
    <header class="ai-patch__head">
      <span class="tag tag--accent">{{ FIELD_LABEL[patch.field] }}</span>
      <span class="tag tag--plain">{{ SOURCE_LABEL[patch.source] }}</span>
      <span v-if="state === 'accepted'" class="tag tag--success">已采纳</span>
      <span v-else-if="state === 'dismissed'" class="tag tag--plain">已忽略</span>
    </header>

    <p v-if="patch.op === 'replace' && patch.baseText" class="ai-patch__base">
      {{ patch.baseText }}
    </p>

    <div v-if="!isEditing" class="ai-patch__body">
      <pre class="ai-patch__text">{{ patch.suggestion }}</pre>
    </div>
    <div v-else class="ai-patch__editing">
      <textarea v-model="edited" rows="4" maxlength="600" />
      <div class="ai-patch__edit-ops">
        <button class="btn btn--ghost btn--sm" @click="isEditing = false">取消</button>
        <button class="btn btn--primary btn--sm" @click="confirmEdit">保存并采纳</button>
      </div>
    </div>

    <p class="ai-patch__reason">
      <span>依据</span>{{ patch.reason }}
    </p>

    <footer class="ai-patch__ops">
      <template v-if="state !== 'accepted'">
        <button class="btn btn--primary btn--sm" @click="emit('accept', patch.id)">采纳</button>
        <button
          v-if="patch.field === 'description' || patch.field === 'acceptance'"
          class="btn btn--ghost btn--sm"
          @click="isEditing = !isEditing"
        >
          {{ isEditing ? '收起编辑' : '编辑后采纳' }}
        </button>
        <button class="ai-patch__dismiss" @click="emit('dismiss', patch.id)">忽略</button>
      </template>
      <button v-else class="ai-patch__dismiss" @click="emit('accept', patch.id)">撤销采纳</button>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.ai-patch {
  padding: $space-4;
  border-radius: $radius-md;
  border: 0.0625rem solid $color-border;
  background: $color-surface;
  display: flex;
  flex-direction: column;
  gap: $space-3;
  transition: border-color $duration-fast, background $duration-fast;

  &--accepted {
    border-color: rgba(46, 125, 91, 0.35);
    background: rgba(46, 125, 91, 0.05);
  }

  &--dismissed {
    opacity: 0.55;
  }
}

.ai-patch__head {
  display: flex;
  gap: $space-2;
  flex-wrap: wrap;
}

.ai-patch__base {
  font-size: $fs-sm;
  color: $color-ink-3;
  text-decoration: line-through;
}

.ai-patch__text {
  margin: 0;
  padding: $space-3;
  border-radius: $radius-sm;
  background: rgba(46, 125, 91, 0.08);
  font-family: inherit;
  font-size: $fs-sm;
  line-height: 1.75;
  color: $color-ink-1;
  white-space: pre-wrap;
}

.ai-patch__editing {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  textarea {
    padding: $space-3;
    border-radius: $radius-sm;
    border: 0.0625rem solid $color-accent;
    font-size: $fs-sm;
    line-height: 1.7;
    resize: vertical;
    outline: none;
  }
}

.ai-patch__edit-ops {
  display: flex;
  justify-content: flex-end;
  gap: $space-2;
}

.ai-patch__reason {
  font-size: $fs-xs;
  color: $color-ink-3;
  line-height: 1.6;

  span {
    display: inline-block;
    margin-right: $space-2;
    padding: 0 0.375rem;
    border-radius: 0.25rem;
    background: $color-accent-soft;
    color: $color-accent-deep;
    font-weight: 700;
  }
}

.ai-patch__ops {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.ai-patch__dismiss {
  font-size: $fs-sm;
  color: $color-ink-3;

  &:hover {
    color: $color-danger;
  }
}
</style>
