<script setup lang="ts">
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { formatPercent } from '@/utils/format';
import type { ITalentItemType } from '@/types/talent';

interface IPropsType {
  talent: ITalentItemType;
}

const props = defineProps<IPropsType>();
const emit = defineEmits<{ invite: [talent: ITalentItemType]; favorite: [talent: ITalentItemType] }>();

const KIND_LABEL: Record<string, string> = { opc: '独立从业者', team: '团队' };
</script>

<template>
  <article class="talent-card card reveal">
    <header class="talent-card__head">
      <UserAvatar :letter="talent.letter" :tone="talent.avatarTone" :size="2.75" />
      <div class="talent-card__id">
        <p class="talent-card__name">
          <b>{{ talent.name }}</b>
          <StatusTag v-if="talent.isRepurchase" label="复购" tone="success" />
        </p>
        <p class="muted">{{ talent.title }}</p>
      </div>
    </header>

    <div class="talent-card__tags">
      <StatusTag :label="talent.certLabel" tone="accent" />
      <StatusTag :label="KIND_LABEL[talent.kind]" :tone="talent.kind === 'team' ? 'teal' : 'plain'" />
      <StatusTag :label="`信用 ${talent.creditScore}`" tone="success" />
    </div>

    <p class="talent-card__skills">
      <span v-for="tag in talent.skillTags" :key="tag" class="tag tag--plain">{{ tag }}</span>
    </p>

    <p class="talent-card__reason">{{ talent.reason }}</p>

    <dl class="talent-card__metrics">
      <div>
        <dt>完单</dt>
        <dd>{{ talent.completedCount }}</dd>
      </div>
      <div>
        <dt>好评率</dt>
        <dd>{{ formatPercent(talent.goodRate) }}</dd>
      </div>
      <div>
        <dt>报价</dt>
        <dd>{{ talent.priceLabel }}</dd>
      </div>
    </dl>

    <footer class="talent-card__ops">
      <button class="btn btn--primary btn--sm" @click="emit('invite', props.talent)">邀约接单</button>
      <button class="btn btn--ghost btn--sm" @click="emit('favorite', props.talent)">收藏</button>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.talent-card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-5;
  transition: transform $duration-fast $ease-out, box-shadow $duration-fast;

  &:hover {
    transform: translateY(-0.1875rem);
    box-shadow: $shadow-float;
  }
}

.talent-card__head {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.talent-card__id {
  min-width: 0;
}

.talent-card__name {
  display: flex;
  align-items: center;
  gap: $space-2;

  b {
    font-size: $fs-md;
    letter-spacing: -0.01em;
  }
}

.talent-card__tags,
.talent-card__skills {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.talent-card__reason {
  font-size: $fs-sm;
  line-height: 1.65;
  color: $color-ink-2;
  flex: 1;
}

.talent-card__metrics {
  display: flex;
  gap: $space-4;
  padding-top: $space-3;
  border-top: 0.0625rem solid $color-border;

  div {
    display: flex;
    flex-direction: column;
  }

  dt {
    font-size: 0.6875rem;
    color: $color-ink-3;
  }

  dd {
    font-size: $fs-base;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
}

.talent-card__ops {
  display: flex;
  gap: $space-2;
}
</style>
