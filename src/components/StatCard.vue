<script setup lang="ts">
import type { IStatItemType } from '@/types/common';

interface IPropsType {
  item: IStatItemType;
}

defineProps<IPropsType>();
</script>

<template>
  <div class="stat-card card" :class="{ 'stat-card--highlight': item.isHighlight }">
    <p class="stat-card__label">{{ item.label }}</p>
    <p class="stat-card__value price">{{ item.value }}</p>
    <p class="stat-card__hint">{{ item.hint }}</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.stat-card {
  padding: $space-5;

  &--highlight {
    background: linear-gradient(135deg, $color-accent, $color-accent-deep);
    border: none;
    color: $color-on-accent;
  }
}

.stat-card__label {
  font-size: $fs-sm;
  color: $color-ink-3;
}

.stat-card--highlight .stat-card__label {
  color: rgba(255, 240, 230, 0.8);
}

.stat-card__value {
  margin-top: $space-2;
  font-size: 1.625rem;
}

.stat-card__hint {
  margin-top: $space-1;
  font-size: $fs-xs;
  color: $color-ink-3;
}

.stat-card--highlight .stat-card__hint {
  color: rgba(255, 240, 230, 0.8);
}
</style>
