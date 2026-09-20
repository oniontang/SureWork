<script setup lang="ts">
import { computed } from 'vue';

import StatusTag from '@/components/StatusTag.vue';
import { CATEGORIES } from '@/constants';
import { formatCurrency } from '@/utils/format';
import type { IDemandType } from '@/types/demand';

interface IPropsType {
  demand: IDemandType;
  /** 当前用户是否具备接单门槛（L2 认证） */
  canAccept: boolean;
}

const props = defineProps<IPropsType>();
const emit = defineEmits<{ bid: [demand: IDemandType]; favorite: [demand: IDemandType]; unlock: [] }>();

const categoryLabel = computed(
  () => CATEGORIES.find((item) => item.value === props.demand.category)?.label ?? props.demand.category,
);
const isLocked = computed(() => props.demand.requiresCertifiedOpc && !props.canAccept);
</script>

<template>
  <article class="demand-card card reveal" :class="{ 'demand-card--locked': isLocked }">
    <h3 class="demand-card__title">
      {{ demand.title }}
      <StatusTag v-if="demand.isEnterpriseVerified" label="已认证企业" tone="accent" />
      <StatusTag v-if="demand.requiresCertifiedOpc" label="仅认证OPC" tone="warning" />
    </h3>

    <p class="demand-card__meta">
      <span>{{ categoryLabel }}</span>
      <span>周期 {{ demand.cycleDays }} 天</span>
      <span>已投 {{ demand.bidCount }} 人</span>
      <span>{{ demand.budgetMode === 'fixed' ? '一口价' : '区间价' }}</span>
    </p>

    <p class="demand-card__desc">{{ demand.description }}</p>

    <footer class="demand-card__foot">
      <p class="price demand-card__price">
        {{ formatCurrency(demand.budgetCents) }}
        <em>{{ demand.budgetRangeLabel }}</em>
      </p>
      <div class="demand-card__ops">
        <button class="btn btn--ghost btn--sm" @click="emit('favorite', demand)">收藏</button>
        <button v-if="isLocked" class="btn btn--ghost btn--sm" @click="emit('unlock')">L2 解锁</button>
        <button v-else class="btn btn--primary btn--sm" @click="emit('bid', demand)">投标</button>
      </div>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.demand-card {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding: $space-5;
  transition: transform $duration-fast $ease-out, box-shadow $duration-fast;

  &:hover {
    transform: translateY(-0.1875rem);
    box-shadow: $shadow-float;
  }

  &--locked {
    background: $color-panel;
    border-style: dashed;
    box-shadow: none;
  }
}

.demand-card__title {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex-wrap: wrap;
  font-size: $fs-md;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.45;
}

.demand-card__meta {
  display: flex;
  gap: $space-4;
  flex-wrap: wrap;
  font-size: $fs-xs;
  color: $color-ink-3;
}

.demand-card__desc {
  @include ellipsis(2);

  font-size: $fs-base;
  color: $color-ink-2;
  line-height: 1.65;
  flex: 1;
}

.demand-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  margin-top: $space-2;
  padding-top: $space-4;
  border-top: 0.0625rem solid $color-border;
}

.demand-card__price {
  font-size: $fs-xl;

  em {
    display: block;
    font-style: normal;
    font-size: $fs-xs;
    font-weight: 500;
    color: $color-ink-3;
  }
}

.demand-card__ops {
  display: flex;
  gap: $space-2;
}
</style>
