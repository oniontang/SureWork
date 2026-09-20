<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { fetchDemanderOrders } from '@/api/order';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAsync } from '@/composables/useAsync';
import { formatCurrency } from '@/utils/format';
import type { IOrderType } from '@/types/order';

const STATUS_TABS = ['全部', '进行中', '待验收', '已完成'] as const;

const router = useRouter();
const { isLoading, run } = useAsync();

const orders = ref<IOrderType[]>([]);
const activeTab = ref<(typeof STATUS_TABS)[number]>('全部');

const filteredOrders = computed(() => {
  if (activeTab.value === '全部') {
    return orders.value;
  }
  const statusMap: Record<string, string[]> = {
    进行中: ['ongoing'],
    待验收: ['accepting'],
    已完成: ['closed', 'settled'],
  };
  return orders.value.filter((order) => (statusMap[activeTab.value] ?? []).includes(order.status));
});

function statusLabel(order: IOrderType): string {
  if (order.status === 'accepting') return 'M2 待验收';
  if (order.status === 'ongoing') return '进行中';
  if (order.status === 'closed') return '已完成';
  if (order.status === 'cancelled') return '已退款';
  return '选人中';
}

onMounted(async () => {
  orders.value = (await run(() => fetchDemanderOrders())) ?? [];
});
</script>

<template>
  <div class="page">
    <header>
      <h1 class="page-title">我的订单</h1>
      <p class="page-subtitle">共 {{ orders.length }} 笔 · 全程托管与留痕 · 状态变更自动通知</p>
    </header>

    <div class="chip-row">
      <button
        v-for="tab in STATUS_TABS"
        :key="tab"
        :class="['chip', { 'chip--on': activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <SkeletonBlock v-if="isLoading" preset="table" />

    <div v-else class="card page__table">
      <table class="table">
        <thead>
          <tr>
            <th>订单</th>
            <th>从业者</th>
            <th>金额</th>
            <th>托管 / 放款</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" @click="router.push(`/demand/orders/${order.id}`)">
            <td>
              <p class="table__title">{{ order.demandTitle }}</p>
              <p class="muted">{{ order.orderNo }} · {{ order.createdAt.slice(5, 10) }} 创建</p>
            </td>
            <td>
              <span class="page__person">
                <UserAvatar :letter="order.counterpartyLetter" :tone="order.counterpartyAvatarTone" :size="1.875" />
                {{ order.counterpartyName }}
              </span>
            </td>
            <td class="price">{{ formatCurrency(order.totalCents) }}</td>
            <td>
              <span class="muted">托管 {{ formatCurrency(order.escrowCents) }}</span>
              <span v-if="order.releasedCents" class="page__released"> · 放款 {{ formatCurrency(order.releasedCents) }}</span>
            </td>
            <td>
              <StatusTag
                :label="statusLabel(order)"
                :tone="order.status === 'accepting' ? 'warning' : order.status === 'closed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'teal'"
              />
            </td>
            <td>
              <button class="btn btn--primary btn--sm" @click.stop="router.push(`/demand/orders/${order.id}`)">
                详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.page {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.page__table {
  padding: 0;
  overflow: hidden;
}

.page__person {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
}

.page__released {
  color: $color-success;
  font-weight: 600;
}
</style>
