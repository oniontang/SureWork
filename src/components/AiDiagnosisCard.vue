<script setup lang="ts">
import type { IDiagnosisItemType } from '@/types/ai';

interface IPropsType {
  understood: string[];
  diagnosis: IDiagnosisItemType[];
  qualityScore: number;
}

defineProps<IPropsType>();

function toneOf(score: number): string {
  if (score >= 70) {
    return 'success';
  }
  if (score >= 45) {
    return 'warning';
  }
  return 'danger';
}
</script>

<template>
  <div class="ai-diagnosis">
    <section class="ai-diagnosis__block">
      <header class="ai-diagnosis__head">
        <b>我已理解的信息</b>
        <span class="muted">有出入可先关闭面板修改表单，我会重新分析</span>
      </header>
      <ul class="ai-diagnosis__list">
        <li v-for="line in understood" :key="line">
          <span class="ai-diagnosis__check">✓</span>{{ line }}
        </li>
      </ul>
    </section>

    <section class="ai-diagnosis__block">
      <header class="ai-diagnosis__head">
        <b>五维诊断</b>
        <span class="ai-diagnosis__score" :class="`ai-diagnosis__score--${toneOf(qualityScore)}`">
          质量分 {{ qualityScore }}
        </span>
      </header>
      <ul class="ai-diagnosis__dims">
        <li v-for="item in diagnosis" :key="item.dimension" class="ai-dim">
          <div class="ai-dim__top">
            <span class="ai-dim__label">{{ item.label }}</span>
            <span class="ai-dim__num" :class="`ai-dim__num--${toneOf(item.score)}`">{{ item.score }}</span>
          </div>
          <span class="ai-dim__bar">
            <i
              :class="`ai-dim__fill--${toneOf(item.score)}`"
              :style="{ width: `${item.score}%` }"
            />
          </span>
          <p class="ai-dim__verdict">{{ item.verdict }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.ai-diagnosis {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.ai-diagnosis__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $space-3;
  margin-bottom: $space-3;

  b {
    font-size: $fs-base;
  }

  .muted {
    font-size: $fs-xs;
  }
}

.ai-diagnosis__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  font-size: $fs-sm;
  line-height: 1.65;
  color: $color-ink-2;
}

.ai-diagnosis__check {
  display: inline-grid;
  place-items: center;
  width: 1rem;
  height: 1rem;
  margin-right: $space-2;
  border-radius: 50%;
  background: $color-success-soft;
  color: $color-success;
  font-size: 0.625rem;
  font-weight: 800;
}

.ai-diagnosis__score {
  font-size: $fs-xs;
  font-weight: 700;
  padding: 0.125rem $space-3;
  border-radius: $radius-pill;

  &--success {
    background: $color-success-soft;
    color: $color-success;
  }

  &--warning {
    background: $color-warning-soft;
    color: $color-warning;
  }

  &--danger {
    background: $color-danger-soft;
    color: $color-danger;
  }
}

.ai-diagnosis__dims {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.ai-dim__top {
  display: flex;
  justify-content: space-between;
  font-size: $fs-sm;
}

.ai-dim__label {
  font-weight: 700;
}

.ai-dim__num {
  font-weight: 800;
  font-variant-numeric: tabular-nums;

  &--success {
    color: $color-success;
  }

  &--warning {
    color: $color-warning;
  }

  &--danger {
    color: $color-danger;
  }
}

.ai-dim__bar {
  display: block;
  height: 0.25rem;
  margin-top: $space-2;
  border-radius: $radius-pill;
  background: $color-panel;
  overflow: hidden;

  i {
    display: block;
    height: 100%;
    border-radius: $radius-pill;
    transition: width $duration-slow $ease-out;
  }
}

.ai-dim__fill {
  &--success {
    background: $color-success;
  }

  &--warning {
    background: $color-warning;
  }

  &--danger {
    background: $color-danger;
  }
}

.ai-dim__verdict {
  margin-top: $space-1;
  font-size: $fs-xs;
  line-height: 1.6;
  color: $color-ink-3;
}
</style>
