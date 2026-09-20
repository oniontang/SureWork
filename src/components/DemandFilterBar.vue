<script setup lang="ts">
import { ref } from 'vue';

import { BUDGET_FILTERS, CATEGORIES, CYCLE_FILTERS, GATE_FILTERS, SORT_OPTIONS } from '@/constants';
import type { IDemandFilterStateType } from '@/composables/useDemandFilter';

interface IPropsType {
  state: IDemandFilterStateType;
  tags: { key: string; label: string }[];
  resultCount: number;
}

defineProps<IPropsType>();
const emit = defineEmits<{
  toggleCategory: [value: string];
  setBudget: [value: string];
  setCycle: [value: string];
  setGate: [value: string];
  setSort: [value: 'newest' | 'budget-desc' | 'bids-asc'];
  removeTag: [key: string];
  reset: [];
}>();

const isCollapsed = ref(false);
</script>

<template>
  <section class="filter-bar card" :class="{ 'filter-bar--collapsed': isCollapsed }">
    <header class="filter-bar__head">
      <b class="filter-bar__title">筛选</b>

      <div class="filter-bar__tags">
        <span v-if="tags.length === 0" class="muted">无</span>
        <span v-for="tag in tags" :key="tag.key" class="filter-bar__tag">
          {{ tag.label }}
          <button :aria-label="`移除条件 ${tag.label}`" @click="emit('removeTag', tag.key)">✕</button>
        </span>
      </div>

      <button v-if="tags.length" class="filter-bar__clear" @click="emit('reset')">清空全部</button>
      <span class="filter-bar__count">共 <b>{{ resultCount }}</b> 个需求</span>
      <button class="filter-bar__fold" @click="isCollapsed = !isCollapsed">
        {{ isCollapsed ? '展开筛选 ▾' : '收起筛选 ▴' }}
      </button>
    </header>

    <div v-show="!isCollapsed" class="filter-bar__body">
      <div class="filter-bar__group">
        <span class="filter-bar__label">品类</span>
        <div class="chip-row">
          <button
            v-for="category in CATEGORIES"
            :key="category.value"
            :class="['chip', { 'chip--on': state.categories.includes(category.value) }]"
            @click="emit('toggleCategory', category.value)"
          >
            {{ category.label }}
          </button>
          <span class="muted filter-bar__tip">可多选，留空为全部品类</span>
        </div>
      </div>

      <div class="filter-bar__group">
        <span class="filter-bar__label">预算</span>
        <div class="chip-row">
          <button
            v-for="band in BUDGET_FILTERS"
            :key="band.value"
            :class="['chip', { 'chip--on': state.budget === band.value }]"
            @click="emit('setBudget', band.value)"
          >
            {{ band.label }}
          </button>
        </div>
      </div>

      <div class="filter-bar__group">
        <span class="filter-bar__label">周期</span>
        <div class="chip-row">
          <button
            v-for="band in CYCLE_FILTERS"
            :key="band.value"
            :class="['chip', { 'chip--on': state.cycle === band.value }]"
            @click="emit('setCycle', band.value)"
          >
            {{ band.label }}
          </button>
        </div>
      </div>

      <div class="filter-bar__group">
        <span class="filter-bar__label">门槛</span>
        <div class="chip-row">
          <button
            v-for="gate in GATE_FILTERS"
            :key="gate.value"
            :class="['chip', { 'chip--on': state.gate === gate.value }]"
            @click="emit('setGate', gate.value)"
          >
            {{ gate.label }}
          </button>
        </div>
      </div>

      <div class="filter-bar__group">
        <span class="filter-bar__label">排序</span>
        <select class="filter-bar__sort" :value="state.sort" @change="emit('setSort', ($event.target as HTMLSelectElement).value as 'newest' | 'budget-desc' | 'bids-asc')">
          <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.filter-bar {
  padding: $space-4 $space-5;
}

.filter-bar__head {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex-wrap: wrap;
}

.filter-bar__title {
  font-size: $fs-md;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.filter-bar__tags {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: $space-2;
  flex-wrap: wrap;
}

.filter-bar__tag {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: 0.1875rem $space-3;
  border-radius: $radius-pill;
  background: $color-accent-soft;
  color: $color-accent-deep;
  font-size: $fs-xs;
  font-weight: 600;

  button {
    display: grid;
    place-items: center;
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 50%;
    background: rgba(194, 67, 31, 0.16);
    color: $color-accent-deep;
    font-size: 0.5625rem;
    line-height: 1;

    &:hover {
      background: rgba(194, 67, 31, 0.3);
    }
  }
}

.filter-bar__clear {
  font-size: $fs-xs;
  color: $color-ink-3;
  text-decoration: underline dotted;

  &:hover {
    color: $color-accent-deep;
  }
}

.filter-bar__count {
  margin-left: auto;
  font-size: $fs-sm;
  color: $color-ink-3;

  b {
    color: $color-accent-deep;
    font-size: $fs-md;
  }
}

.filter-bar__fold {
  flex: none;
  padding: $space-2 $space-4;
  border-radius: $radius-pill;
  background: $color-accent-soft;
  color: $color-accent-deep;
  font-size: $fs-sm;
  font-weight: 600;
  transition: background $duration-fast;

  &:hover {
    background: rgba(228, 87, 46, 0.18);
  }
}

.filter-bar__body {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin-top: $space-4;
}

.filter-bar__group {
  display: flex;
  align-items: flex-start;
  gap: $space-3;

  & + & {
    border-top: 0.0625rem dashed $color-border;
    padding-top: $space-3;
  }
}

.filter-bar__label {
  flex: none;
  width: 2.25rem;
  line-height: 2;
  font-size: $fs-xs;
  font-weight: 600;
  color: $color-ink-3;
}

.filter-bar__tip {
  align-self: center;
}

.filter-bar__sort {
  padding: $space-2 $space-3;
  border: 0.0625rem solid $color-border;
  border-radius: $radius-sm;
  background: $color-surface;
  font-size: $fs-sm;
  color: $color-ink-2;
  cursor: pointer;
}
</style>
