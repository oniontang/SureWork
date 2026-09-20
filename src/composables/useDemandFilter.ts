import { computed, reactive } from 'vue';
import type { Ref } from 'vue';

import { BUDGET_FILTERS, CATEGORIES, CYCLE_FILTERS } from '@/constants';
import type { IDemandType } from '@/types/demand';

export interface IDemandFilterStateType {
  categories: string[];
  budget: string;
  cycle: string;
  gate: string;
  sort: 'newest' | 'budget-desc' | 'bids-asc';
}

const GATE_LABELS: Record<string, string> = {
  enterprise: '已认证企业',
  unlockable: '可解锁高预算单',
};

/** 可组合筛选：品类多选 ∪ 预算档 ∩ 周期档 ∩ 门槛 + 排序 */
export function useDemandFilter(source: Ref<IDemandType[]>) {
  const state = reactive<IDemandFilterStateType>({
    categories: [],
    budget: 'all',
    cycle: 'all',
    gate: 'all',
    sort: 'newest',
  });

  function matchBudget(demand: IDemandType): boolean {
    const band = BUDGET_FILTERS.find((item) => item.value === state.budget);
    if (!band) {
      return true;
    }
    return demand.budgetCents >= band.min && demand.budgetCents <= band.max;
  }

  function matchCycle(demand: IDemandType): boolean {
    const band = CYCLE_FILTERS.find((item) => item.value === state.cycle);
    return !band || demand.cycleDays <= band.maxDays;
  }

  function matchGate(demand: IDemandType): boolean {
    if (state.gate === 'enterprise') {
      return demand.isEnterpriseVerified;
    }
    if (state.gate === 'unlockable') {
      return demand.requiresCertifiedOpc || demand.budgetCents >= 1_000_000;
    }
    return true;
  }

  const filtered = computed(() => {
    const list = source.value.filter(
      (demand) =>
        (state.categories.length === 0 || state.categories.includes(demand.category)) &&
        matchBudget(demand) &&
        matchCycle(demand) &&
        matchGate(demand),
    );

    return list.sort((a, b) => {
      if (state.sort === 'budget-desc') {
        return b.budgetCents - a.budgetCents;
      }
      if (state.sort === 'bids-asc') {
        return a.bidCount - b.bidCount;
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  });

  const selectedTags = computed(() => {
    const tags: { key: string; label: string }[] = [];
    state.categories.forEach((category) => {
      const label = CATEGORIES.find((item) => item.value === category)?.label ?? category;
      tags.push({ key: `cat:${category}`, label: `品类：${label}` });
    });
    if (state.budget !== 'all') {
      const band = BUDGET_FILTERS.find((item) => item.value === state.budget);
      tags.push({ key: 'budget', label: `预算 ${band?.label ?? ''}` });
    }
    if (state.cycle !== 'all') {
      const band = CYCLE_FILTERS.find((item) => item.value === state.cycle);
      tags.push({ key: 'cycle', label: `周期 ${band?.label ?? ''}` });
    }
    if (state.gate !== 'all') {
      tags.push({ key: 'gate', label: GATE_LABELS[state.gate] ?? '' });
    }
    return tags;
  });

  function toggleCategory(category: string): void {
    const index = state.categories.indexOf(category);
    if (index >= 0) {
      state.categories.splice(index, 1);
    } else {
      state.categories.push(category);
    }
  }

  function removeTag(key: string): void {
    if (key.startsWith('cat:')) {
      toggleCategory(key.slice(4));
      return;
    }
    if (key === 'budget' || key === 'cycle' || key === 'gate') {
      state[key] = 'all';
    }
  }

  function reset(): void {
    state.categories = [];
    state.budget = 'all';
    state.cycle = 'all';
    state.gate = 'all';
    state.sort = 'newest';
  }

  return { state, filtered, selectedTags, toggleCategory, removeTag, reset };
}
