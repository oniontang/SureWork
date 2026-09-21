<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { fetchBidsByDemand, fetchDemandDetail } from '@/api/demand';
import { selectBidder } from '@/api/order';
import EmptyState from '@/components/EmptyState.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { CATEGORIES, DEFAULT_BID_MANAGE_DEMAND_ID } from '@/constants';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatCurrency, formatPercent } from '@/utils/format';
import type { IBidType, IDemandType } from '@/types/demand';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { isLoading, error, run, runAction } = useAsync();

const demandId = String(route.params.demandId ?? DEFAULT_BID_MANAGE_DEMAND_ID);
const demand = ref<IDemandType | null>(null);
const bids = ref<IBidType[]>([]);

const categoryLabel = computed(
  () => CATEGORIES.find((item) => item.value === demand.value?.category)?.label ?? '—',
);

async function handleSelect(bid: IBidType): Promise<void> {
  const result = await runAction(() => selectBidder(bid.id));
  if (!result) {
    toast(error.value ?? '选定投标人失败，请稍后重试', 'error');
    return;
  }
  toast(`已向 ${bid.opcName} 发起订单确认，对方接单后进入合同与托管付款`, 'success');
  router.push('/demand/workbench');
}

onMounted(async () => {
  const data = await run(async () => {
    const [demandData, bidList] = await Promise.all([
      fetchDemandDetail(demandId),
      fetchBidsByDemand(demandId),
    ]);
    return { demandData, bidList };
  });
  demand.value = data?.demandData ?? null;
  bids.value = data?.bidList ?? [];
});
</script>

<template>
  <div class="page">
    <SkeletonBlock v-if="isLoading" preset="table" />

    <EmptyState v-else-if="!demand" text="该需求已下架或不存在" />

    <template v-else>
    <header class="page__head">
      <div>
        <h1 class="page-title">{{ demand.title }}</h1>
        <p class="page-subtitle">
          预算 {{ formatCurrency(demand.budgetCents) }} · 周期 {{ demand.cycleDays }} 天 ·
          <StatusTag label="机审+人审已通过" tone="teal" />
        </p>
      </div>
      <StatusTag label="48 小时答复窗口 · 剩 31 小时" tone="warning" />
    </header>

    <div class="page__cols">
      <section>
        <div class="section-head">
          <b>投标候选 · {{ bids.length }}</b>
          <span class="muted">按信用分排序 ▾</span>
        </div>

        <div class="page__bids">
          <article v-for="bid in bids" :key="bid.id" class="card bid-card reveal">
            <UserAvatar :letter="bid.avatarLetter" :tone="bid.avatarTone" :size="2.75" />
            <div class="bid-card__main">
              <p class="bid-card__name">
                <b>{{ bid.opcName }}</b>
                <StatusTag v-if="bid.isCertified" label="认证OPC" tone="accent" />
                <StatusTag :label="`信用 ${bid.creditScore}`" tone="success" />
                <span class="muted">完单 {{ bid.completedCount }} · 好评 {{ formatPercent(bid.goodRate) }}</span>
              </p>
              <p class="bid-card__proposal">{{ bid.proposal }}</p>
              <div class="chip-row">
                <span v-for="tag in [bid.scheduleLabel, ...bid.highlightTags]" :key="tag" class="tag tag--plain">
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="bid-card__side">
              <p class="price bid-card__price">{{ formatCurrency(bid.priceCents) }}</p>
              <div class="bid-card__ops">
                <button class="btn btn--ghost btn--sm" @click="toast('演示原型：打开从业者主页')">主页</button>
                <button class="btn btn--primary btn--sm" @click="handleSelect(bid)">选定 TA</button>
              </div>
            </div>
          </article>

          <EmptyState v-if="bids.length === 0" text="该需求暂无投标" />
        </div>

        <p class="hint-box page__hint">
          落选的投标人会收到你勾选的原因（价格 / 作品风格 / 排期），帮助从业者迭代方案；选定后平台生成电子合同并引导托管付款。
        </p>
      </section>

      <aside class="card page__aside">
        <b>需求卡</b>
        <p class="muted page__aside-meta">
          品类：{{ categoryLabel }}<br />
          预算：{{ formatCurrency(demand.budgetCents) }}（区间价）<br />
          周期：{{ demand.cycleDays }} 天<br />
          交付：{{ demand.deliverables.join(' / ') }}<br />
          浏览 86 · 投标 {{ bids.length }}
        </p>
        <div class="page__aside-block">
          <b>验收标准</b>
          <ul class="page__accept">
            <li v-for="item in demand.acceptance" :key="item">{{ item }}</li>
          </ul>
        </div>
        <button class="btn btn--ghost btn--block" @click="toast('演示原型：关闭需求并进入互评')">
          关闭需求并互评
        </button>
      </aside>
    </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.page {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.page__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-4;
  flex-wrap: wrap;
}

.page__cols {
  display: grid;
  grid-template-columns: 1fr 21.25rem;
  gap: $space-5;
  align-items: start;
}

.page__bids {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  margin-top: $space-3;
}

.bid-card {
  display: flex;
  gap: $space-5;
  align-items: flex-start;
}

.bid-card__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.bid-card__name {
  display: flex;
  align-items: center;
  gap: $space-2;
  flex-wrap: wrap;

  b {
    font-size: $fs-md;
  }
}

.bid-card__proposal {
  font-size: $fs-sm;
  color: $color-ink-2;
  line-height: 1.65;
}

.bid-card__side {
  flex: none;
  text-align: right;
}

.bid-card__price {
  font-size: $fs-xl;
}

.bid-card__ops {
  display: flex;
  gap: $space-2;
  margin-top: $space-3;
}

.page__hint {
  margin-top: $space-4;
}

.page__aside {
  position: sticky;
  top: 5.5rem;
  display: flex;
  flex-direction: column;
  gap: $space-4;

  > b {
    font-size: $fs-md;
  }
}

.page__aside-meta {
  line-height: 1.9;
}

.page__aside-block {
  padding-top: $space-4;
  border-top: 0.0625rem solid $color-border;

  b {
    font-size: $fs-sm;
  }
}

.page__accept {
  margin-top: $space-2;
  padding-left: 1.125rem;
  list-style: decimal;
  font-size: $fs-sm;
  color: $color-ink-3;
  line-height: 1.8;
}
</style>
