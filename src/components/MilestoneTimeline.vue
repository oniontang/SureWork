<script setup lang="ts">
import { computed } from 'vue';

import StatusTag from '@/components/StatusTag.vue';
import { MAX_REJECT_COUNT } from '@/constants';
import { formatCurrency, formatHoursToDays } from '@/utils/format';
import type { IMilestoneType } from '@/types/order';

interface IPropsType {
  milestones: IMilestoneType[];
  /** 视角：需求方可验收，从业者可上传交付物 */
  perspective?: 'demander' | 'provider';
}

const props = withDefaults(defineProps<IPropsType>(), { perspective: 'demander' });
const emit = defineEmits<{ verify: [milestone: IMilestoneType]; deliver: [milestone: IMilestoneType] }>();

const splitLabel = computed(() => {
  const total = props.milestones.reduce((sum, item) => sum + item.amountCents, 0);
  return props.milestones
    .map((item) => `${Math.round((item.amountCents / total) * 100)}%`)
    .join(' / ');
});

function statusTag(milestone: IMilestoneType): { label: string; tone: 'success' | 'warning' | 'plain' } | null {
  if (milestone.status === 'paid') {
    return { label: props.perspective === 'demander' ? '已放款' : '已到账', tone: 'success' };
  }
  if (milestone.status === 'delivered') {
    return { label: '待验收', tone: 'warning' };
  }
  return null;
}
</script>

<template>
  <div class="milestone">
    <header class="milestone__head">
      <b>里程碑进度 <span class="muted">· {{ splitLabel }}</span></b>
      <span class="muted">驳回上限 {{ MAX_REJECT_COUNT }} 次 · 僵持自动进入仲裁</span>
    </header>

    <ol class="milestone__list">
      <li
        v-for="item in milestones"
        :key="item.id"
        class="milestone__row"
        :class="`milestone__row--${item.status}`"
      >
        <span class="milestone__node" aria-hidden="true" />

        <div class="milestone__body">
          <p class="milestone__title">
            {{ item.title }}
            <StatusTag v-if="statusTag(item)" :label="statusTag(item)!.label" :tone="statusTag(item)!.tone" />
          </p>

          <p v-if="item.status === 'paid'" class="milestone__desc">
            {{ perspective === 'demander' ? '验收通过 · ' : '对方验收 · ' }}放款
            {{ formatCurrency(perspective === 'demander' ? item.amountCents : Math.round(item.amountCents * 0.9)) }}
            （{{ perspective === 'demander' ? '分账至对方账户' : 'T+1 到账' }}）
          </p>
          <p v-else-if="item.status === 'delivered'" class="milestone__desc milestone__desc--active">
            {{ item.deliverableSummary }}
          </p>
          <p v-else class="milestone__desc">
            {{ item.status === 'pending' ? '待上一里程碑验收后开始' : '未开始' }} ·
            {{ formatCurrency(item.amountCents) }}
          </p>

          <p v-if="item.autoAcceptRemainHours" class="countdown">
            ⏱ 剩余 {{ formatHoursToDays(item.autoAcceptRemainHours) }} ·
            {{
              perspective === 'demander'
                ? '逾期自动视为验收通过'
                : '对方未处理将自动放款'
            }}
          </p>

          <div v-if="item.status === 'delivered'" class="milestone__ops">
            <template v-if="perspective === 'demander'">
              <button class="btn btn--ghost btn--sm" @click="emit('verify', item)">查看交付物</button>
              <button class="btn btn--primary btn--sm" @click="emit('verify', item)">验收处理</button>
            </template>
            <template v-else>
              <button class="btn btn--ghost btn--sm" @click="emit('deliver', item)">补充交付</button>
            </template>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.milestone__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $space-4;
  flex-wrap: wrap;

  b {
    font-size: $fs-md;
  }
}

.milestone__list {
  list-style: none;
  margin-top: $space-5;
}

.milestone__row {
  position: relative;
  padding: 0 0 $space-6 1.875rem;

  &::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 1.25rem;
    bottom: -0.25rem;
    width: 0.125rem;
    background: $color-border;
  }

  &:last-child::before {
    display: none;
  }
}

.milestone__node {
  position: absolute;
  left: 0;
  top: 0.1875rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  border: 0.125rem solid $color-border;
  background: $color-surface;
}

.milestone__row--paid .milestone__node {
  background: $color-success;
  border-color: $color-success;
}

.milestone__row--delivered .milestone__node {
  background: $color-accent;
  border-color: $color-accent;
  box-shadow: 0 0 0 0.25rem $color-accent-soft;
}

.milestone__title {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex-wrap: wrap;
  font-size: $fs-md;
  font-weight: 700;
}

.milestone__desc {
  margin-top: $space-2;
  font-size: $fs-sm;
  color: $color-ink-3;

  &--active {
    color: $color-accent-deep;
    font-weight: 600;
  }
}

.milestone__ops {
  display: flex;
  gap: $space-3;
  margin-top: $space-4;
}
</style>
