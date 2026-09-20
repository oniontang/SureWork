<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { fetchBanners, fetchDemands, fetchNotices } from '@/api/demand';
import BannerCarousel from '@/components/BannerCarousel.vue';
import DemandCard from '@/components/DemandCard.vue';
import DemandFilterBar from '@/components/DemandFilterBar.vue';
import EmptyState from '@/components/EmptyState.vue';
import NoticeBoard from '@/components/NoticeBoard.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import { DEMAND_PAGE_SIZE } from '@/constants';
import { useAsync } from '@/composables/useAsync';
import { useDemandFilter } from '@/composables/useDemandFilter';
import { useToast } from '@/composables/useToast';
import type { IBannerType, IDemandType, INoticeType } from '@/types/demand';

const router = useRouter();
const { isLoading, run } = useAsync();
const toast = useToast();

const allDemands = ref<IDemandType[]>([]);
const banners = ref<IBannerType[]>([]);
const notices = ref<INoticeType[]>([]);
const visibleCount = ref(DEMAND_PAGE_SIZE);

const {
  state: filterState,
  filtered,
  selectedTags,
  toggleCategory,
  removeTag,
  reset: resetFilter,
} = useDemandFilter(allDemands);

const visibleDemands = computed(() => filtered.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < filtered.value.length);

function handleFavorite(demand: IDemandType): void {
  toast(`已收藏「${demand.title}」，新投标将站内提醒`);
}

function handleUnlock(): void {
  toast('演示原型：跳转 L2 认证页（作品集人工审核）');
}

/** 投标入口统一进需求详情：看清全文与验收标准后再决策 */
function goDetail(demand: IDemandType): void {
  router.push(`/provider/demands/${demand.id}`);
}

async function handleLoadMore(): Promise<void> {
  const next = await run(() => fetchDemands(), { skeleton: false });
  if (next) {
    visibleCount.value += DEMAND_PAGE_SIZE;
    const appended = Math.min(
      DEMAND_PAGE_SIZE,
      Math.max(filtered.value.length - visibleCount.value + DEMAND_PAGE_SIZE, 1),
    );
    toast(`已为你加载 ${appended} 个新需求`);
  }
}

onMounted(async () => {
  const [demandList, bannerList, noticeList] = await Promise.all([
    run(() => fetchDemands()),
    run(() => fetchBanners()),
    run(() => fetchNotices()),
  ]);
  allDemands.value = demandList ?? [];
  banners.value = bannerList ?? [];
  notices.value = noticeList ?? [];
});
</script>

<template>
  <div class="hall">
    <header class="hall__head">
      <div>
        <h1 class="page-title">抢单大厅</h1>
        <p class="page-subtitle">
          林一舟 · <StatusTag label="认证OPC" tone="accent" /> · 信用分 912 · 今日新增 12 个需求
        </p>
      </div>
      <span class="muted">投标限 1 次/需求 · 需求方 48 小时内答复</span>
    </header>

    <SkeletonBlock v-if="isLoading" preset="cards" />

    <template v-else>
      <section class="hall__top">
        <BannerCarousel :banners="banners" @action="toast('演示原型：跳转活动落地页')" />
        <div class="hall__side">
          <article class="hall__spotlight">
            <span class="hall__spotlight-mark">约</span>
            <b>如约创作者周榜</b>
            <p>每周一更新 · 上榜作品获首页曝光位与优先派单权重</p>
            <button class="btn btn--white btn--sm" @click="toast('演示原型：打开周榜')">查看榜单</button>
          </article>
          <NoticeBoard :notices="notices" @more="toast('演示原型：打开公告列表')" />
        </div>
      </section>

      <DemandFilterBar
        :state="filterState"
        :tags="selectedTags"
        :result-count="filtered.length"
        @toggle-category="toggleCategory"
        @set-budget="filterState.budget = $event"
        @set-cycle="filterState.cycle = $event"
        @set-gate="filterState.gate = $event"
        @set-sort="filterState.sort = $event"
        @remove-tag="removeTag"
        @reset="resetFilter"
      />

      <section class="hall__grid">
        <DemandCard
          v-for="demand in visibleDemands"
          :key="demand.id"
          :demand="demand"
          :can-accept="true"
          @bid="goDetail"
          @favorite="handleFavorite"
          @unlock="handleUnlock"
        />
      </section>

      <EmptyState v-if="visibleDemands.length === 0" text="没有符合条件的需求，试试放宽筛选条件" />

      <footer class="hall__foot">
        <button v-if="hasMore" class="btn btn--ghost" @click="handleLoadMore">加载更多需求 ▾</button>
        <span v-else class="muted">已加载全部 {{ filtered.length }} 个需求</span>
      </footer>
    </template>

  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.hall {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.hall__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-4;
  flex-wrap: wrap;
}

.hall__top {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  align-items: stretch;
  gap: $space-4;
}

.hall__side {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  min-height: 0;
}

.hall__spotlight {
  position: relative;
  overflow: hidden;
  padding: $space-5;
  border-radius: $radius-lg;
  color: #fff;
  background: radial-gradient(130% 170% at 88% -10%, #5a2c17 0%, #241812 55%, #17100c 100%);
  border: 0.0625rem solid rgba(255, 230, 210, 0.1);

  b {
    display: block;
    font-size: $fs-lg;
  }

  p {
    margin: $space-2 0 $space-4;
    font-size: $fs-xs;
    color: rgba(255, 235, 220, 0.72);
  }
}

.hall__spotlight-mark {
  display: grid;
  place-items: center;
  width: 2.125rem;
  height: 2.125rem;
  margin-bottom: $space-4;
  border-radius: $radius-sm;
  background: $color-accent;
  font-weight: 800;
}

.hall__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;
}

.hall__foot {
  display: flex;
  justify-content: center;
  padding-top: $space-2;
}
</style>
