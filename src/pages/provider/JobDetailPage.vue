<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { fetchOrderDetail } from '@/api/order';
import EmptyState from '@/components/EmptyState.vue';
import MilestoneTimeline from '@/components/MilestoneTimeline.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatCurrency } from '@/utils/format';
import type { IOrderType } from '@/types/order';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { isLoading, run } = useAsync();

const job = ref<IOrderType | null>(null);

const income = computed(() => {
  if (!job.value) {
    return { total: 0, paid: 0, escrow: 0 };
  }
  const paid = job.value.milestones
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + Math.round(item.amountCents * 0.9), 0);
  const escrow = job.value.milestones
    .filter((item) => item.status !== 'paid')
    .reduce((sum, item) => sum + Math.round(item.amountCents * 0.9), 0);
  return { total: Math.round(job.value.totalCents * 0.9), paid, escrow };
});

onMounted(async () => {
  job.value = await run(() => fetchOrderDetail(String(route.params.id)));
});
</script>

<template>
  <div class="page">
    <SkeletonBlock v-if="isLoading" preset="table" />

    <EmptyState v-else-if="!job" text="订单不存在或已删除" />

    <template v-else>
      <header class="page__head">
        <div>
          <h1 class="page-title">{{ job.demandTitle }}</h1>
          <p class="page-subtitle">
            编号 {{ job.orderNo }} · {{ job.counterpartyName }} ·
            <StatusTag label="M2 待对方验收" tone="warning" />
          </p>
        </div>
        <div class="page__head-ops">
          <button class="btn btn--ghost" @click="toast('演示原型：打开催验收消息模板')">催验收</button>
          <button class="btn btn--ghost" @click="toast('已申请平台介入，款项冻结中')">平台介入</button>
        </div>
      </header>

      <div class="page__cols">
        <article class="card">
          <MilestoneTimeline :milestones="job.milestones" perspective="provider" @deliver="toast('演示原型：打开上传交付物')" />
          <p class="hint-box page__hint">
            履约提示：交付承诺以会话内结构化卡片为准；驳回不超过 3 次，僵持可申请平台介入，仲裁期间款项冻结。
          </p>
        </article>

        <aside class="page__aside">
          <article class="income-card">
            <p class="income-card__label">本单预计收入（已扣 10% 服务费）</p>
            <p class="price income-card__value">{{ formatCurrency(income.total) }}</p>
            <div class="stat-line income-card__stats">
              <div><b>{{ formatCurrency(income.paid) }}</b><span>已到账</span></div>
              <div><b>{{ formatCurrency(income.escrow) }}</b><span>托管中</span></div>
            </div>
            <p class="income-card__note">结算后个税由灵活用工平台代征，完税凭证自动归档</p>
          </article>

          <article class="card">
            <b class="card-title">需求方 · {{ job.counterpartyName }}</b>
            <p class="muted page__meta">
              认证企业 · 3 次合作 · 验收平均 1.2 天<br />
              付款爽快度 4.9 / 需求清晰度 4.7（历史互评）
            </p>
            <button class="btn btn--ghost btn--block page__op" @click="router.push('/chat')">打开会话</button>
          </article>
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

.page__head-ops {
  display: flex;
  gap: $space-3;
}

.page__cols {
  display: grid;
  grid-template-columns: 1fr 21.25rem;
  gap: $space-5;
  align-items: start;
}

.page__aside {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.page__hint {
  margin-top: $space-5;
}

.income-card {
  padding: $space-5;
  border-radius: $radius-lg;
  border: none;
  color: #fff;
  background: linear-gradient(135deg, $color-accent-deep, #9a2f10);

  b {
    color: #fff;
  }

  span {
    color: rgba(255, 235, 225, 0.8);
  }
}

.income-card__label {
  font-size: $fs-sm;
  color: rgba(255, 235, 225, 0.85);
}

.income-card__value {
  margin-top: $space-2;
  font-size: 1.875rem;
}

.income-card__stats {
  margin-top: $space-4;
  padding-top: $space-4;
  border-top: 0.0625rem solid rgba(255, 240, 220, 0.16);
}

.income-card__note {
  margin-top: $space-4;
  font-size: $fs-xs;
  color: rgba(255, 235, 225, 0.75);
}

.card-title {
  display: block;
  margin-bottom: $space-4;
  font-size: $fs-md;
}

.page__meta {
  line-height: 1.9;
}

.page__op {
  margin-top: $space-4;
}
</style>
