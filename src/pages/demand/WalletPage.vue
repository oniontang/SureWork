<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { fetchDemanderWallet } from '@/api/payment';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatCard from '@/components/StatCard.vue';
import StatusTag from '@/components/StatusTag.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatCurrency, formatDate } from '@/utils/format';
import type { IStatItemType } from '@/types/common';
import type { ILedgerItemType, IWalletOverviewType } from '@/types/payment';

const { isLoading, run } = useAsync();
const toast = useToast();

const overview = ref<IWalletOverviewType | null>(null);
const ledger = ref<ILedgerItemType[]>([]);

const stats = ref<IStatItemType[]>([]);

function buildStats(data: IWalletOverviewType): IStatItemType[] {
  return [
    { id: 'w-1', label: '托管中（未验收）', value: formatCurrency(data.escrowCents), hint: '2 笔订单 · 验收后自动放款', isHighlight: true },
    { id: 'w-2', label: '本月支出', value: formatCurrency(data.mainCents), hint: '含平台服务费' },
    { id: 'w-3', label: '累计支出', value: formatCurrency(data.secondaryCents), hint: '11 笔订单' },
    { id: 'w-4', label: '已退款', value: formatCurrency(data.tertiaryCents), hint: '超时未接单 · 原路退回' },
  ];
}

onMounted(async () => {
  const data = await run(() => fetchDemanderWallet());
  if (data) {
    overview.value = data.overview;
    ledger.value = data.ledger;
    stats.value = buildStats(data.overview);
  }
});
</script>

<template>
  <div class="page">
    <header>
      <h1 class="page-title">资金工作台</h1>
      <p class="page-subtitle">资金全程走持牌支付机构托管与分账 · 平台不经手货款</p>
    </header>

    <SkeletonBlock v-if="isLoading" preset="dash" />

    <template v-else>
      <section class="page__stats">
        <StatCard v-for="item in stats" :key="item.id" :item="item" />
      </section>

      <section>
        <div class="section-head">
          <b>资金流水</b>
          <button class="muted page__link" @click="toast('演示原型：导出对账单')">导出对账单 ›</button>
        </div>

        <div class="card page__table">
          <table class="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>事项</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ledger" :key="item.id">
                <td class="muted">{{ formatDate(item.createdAt) }}</td>
                <td>
                  <p class="table__title">{{ item.title }}</p>
                  <p class="muted">{{ item.meta }}</p>
                </td>
                <td class="price" :class="{ 'page__plus': item.amountCents > 0 }">
                  {{ item.amountCents > 0 ? '+' : '-' }}{{ formatCurrency(Math.abs(item.amountCents)) }}
                </td>
                <td>
                  <StatusTag :label="item.statusLabel" :tone="item.tone === 'success' ? 'success' : item.tone === 'teal' ? 'teal' : 'plain'" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="hint-box">
        发票：平台就服务费开具 6% 增值税专用发票；从业者报酬经灵活用工平台代征个税，完税凭证可在对应订单详情下载。
      </p>
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

.page__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
}

.page__table {
  margin-top: $space-3;
  padding: 0;
  overflow: hidden;
}

.page__link:hover {
  color: $color-accent-deep;
}

.page__plus {
  color: $color-success;
}
</style>
