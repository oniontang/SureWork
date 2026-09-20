<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { fetchProviderJobs, fetchProviderStats } from '@/api/order';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatCard from '@/components/StatCard.vue';
import StatusTag from '@/components/StatusTag.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatCurrency } from '@/utils/format';
import type { IStatItemType } from '@/types/common';
import type { IOrderType } from '@/types/order';

const router = useRouter();
const toast = useToast();
const { isLoading, run } = useAsync();

const stats = ref<IStatItemType[]>([]);
const jobs = ref<IOrderType[]>([]);

onMounted(async () => {
  const [statList, jobList] = await Promise.all([
    run(() => fetchProviderStats()),
    run(() => fetchProviderJobs()),
  ]);
  stats.value = statList ?? [];
  jobs.value = jobList ?? [];
});
</script>

<template>
  <div class="page">
    <header>
      <h1 class="page-title">接单管理</h1>
      <p class="page-subtitle">本月已结算 ¥18,200 · 托管中 ¥4,284 · 全部自动分账</p>
    </header>

    <SkeletonBlock v-if="isLoading" preset="dash" />

    <template v-else>
      <section class="page__stats">
        <StatCard v-for="item in stats" :key="item.id" :item="item" />
      </section>

      <div class="card page__table">
        <table class="table">
          <thead>
            <tr>
              <th>订单</th>
              <th>需求方</th>
              <th>预计收入</th>
              <th>里程碑</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id" @click="router.push(`/provider/jobs/${job.id}`)">
              <td>
                <p class="table__title">{{ job.demandTitle }}</p>
                <p class="muted">{{ job.orderNo }} · {{ job.milestones.filter((m) => m.status === 'delivered').length ? 'M2 已交付' : '进行中' }}</p>
              </td>
              <td>
                <span class="page__person">
                  {{ job.counterpartyName }}
                  <StatusTag v-if="job.counterpartyVerified" label="认证企业" tone="accent" />
                </span>
              </td>
              <td class="price">{{ formatCurrency(Math.round(job.totalCents * 0.9)) }}</td>
              <td class="page__progress">
                <span class="progress"><i :style="{ width: `${job.progressPercent}%` }" /></span>
                <em class="muted">{{ job.progressPercent }}%</em>
              </td>
              <td>
                <StatusTag
                  :label="job.status === 'accepting' ? '待验收' : job.status === 'ongoing' ? '进行中' : '已完成'"
                  :tone="job.status === 'accepting' ? 'warning' : job.status === 'ongoing' ? 'teal' : 'success'"
                />
              </td>
              <td>
                <button class="btn btn--primary btn--sm" @click.stop="router.push(`/provider/jobs/${job.id}`)">
                  详情
                </button>
                <button
                  v-if="job.status === 'accepting'"
                  class="btn btn--ghost btn--sm page__urge"
                  @click.stop="toast('演示原型：打开催验收消息模板')"
                >
                  催验收
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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

.page__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.page__progress {
  width: 9rem;

  .progress {
    display: block;
  }

  em {
    display: block;
    margin-top: $space-1;
    font-style: normal;
  }
}

.page__urge {
  margin-left: $space-2;
}
</style>
