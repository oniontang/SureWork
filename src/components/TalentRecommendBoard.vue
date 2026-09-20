<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { fetchRecommendedTalents, inviteTalent } from '@/api/talent';
import TalentRecommendCard from '@/components/TalentRecommendCard.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import type { ITalentItemType } from '@/types/talent';

interface IPropsType {
  /** 展示条数 */
  limit?: number;
}

const props = withDefaults(defineProps<IPropsType>(), { limit: 4 });
const emit = defineEmits<{ viewAll: [] }>();

const { isLoading, run } = useAsync();
const toast = useToast();
const talents = ref<ITalentItemType[]>([]);

async function handleInvite(talent: ITalentItemType): Promise<void> {
  await run(() => inviteTalent(talent.id), { skeleton: false });
  toast(`已向 ${talent.name} 发出邀约，对方确认后可直接派单`, 'success');
}

function handleFavorite(talent: ITalentItemType): void {
  toast(`已收藏 ${talent.name}，可在「收藏的 OPC」中一键派单`);
}

onMounted(async () => {
  talents.value = (await run(() => fetchRecommendedTalents(props.limit))) ?? [];
});
</script>

<template>
  <section class="talent-board" aria-labelledby="talent-board-title">
    <header class="talent-board__head">
      <div>
        <h2 id="talent-board-title" class="talent-board__title">为你推荐的优质 OPC 与团队</h2>
        <p class="talent-board__sub">
          按你的品类、预算档与历史合作智能匹配 · 邀约后走同一份电子合同与资金托管
        </p>
      </div>
      <button class="talent-board__more" @click="emit('viewAll')">查看全部榜单 ›</button>
    </header>

    <div v-if="isLoading" class="talent-board__grid">
      <div v-for="index in props.limit" :key="`skel-${index}`" class="skeleton talent-board__skel" />
    </div>

    <div v-else class="talent-board__grid">
      <TalentRecommendCard
        v-for="talent in talents"
        :key="talent.id"
        :talent="talent"
        @invite="handleInvite"
        @favorite="handleFavorite"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.talent-board {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5;
  border-radius: $radius-xl;
  background: linear-gradient(160deg, rgba(228, 87, 46, 0.09) 0%, rgba(228, 87, 46, 0.03) 42%, transparent 78%);
  border: 0.0625rem solid $color-border;
}

.talent-board__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-4;
  flex-wrap: wrap;
}

.talent-board__title {
  font-size: $fs-xl;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.talent-board__sub {
  margin-top: $space-1;
  font-size: $fs-sm;
  color: $color-ink-3;
}

.talent-board__more {
  font-size: $fs-sm;
  font-weight: 600;
  color: $color-accent-deep;

  &:hover {
    text-decoration: underline;
  }
}

.talent-board__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
}

.talent-board__skel {
  height: 21rem;
  border-radius: $radius-lg;
}

@media (max-width: 75rem) {
  .talent-board__grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
