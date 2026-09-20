<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { applyWithdraw, fetchProviderWallet } from '@/api/payment';
import BaseModal from '@/components/BaseModal.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatCurrency, formatDate } from '@/utils/format';
import type { ILedgerItemType, IWalletOverviewType, IWithdrawAccountType } from '@/types/payment';

const { isLoading, isSubmitting, run, runAction } = useAsync();
const toast = useToast();

const overview = ref<IWalletOverviewType | null>(null);
const ledger = ref<ILedgerItemType[]>([]);
const account = ref<IWithdrawAccountType | null>(null);
const isWithdrawOpen = ref(false);
const amountYuan = ref(0);

async function handleWithdraw(): Promise<void> {
  const isDone = await runAction(() => applyWithdraw(Math.round(amountYuan.value * 100)));
  if (!isDone) {
    toast(`提现失败：${formatCurrency(Math.round(amountYuan.value * 100))} 超出可提现余额`, 'error');
    return;
  }
  isWithdrawOpen.value = false;
  toast('提现申请成功，T+1 到账', 'success');
}

function openWithdraw(): void {
  if (overview.value) {
    amountYuan.value = overview.value.mainCents / 100;
  }
  isWithdrawOpen.value = true;
}

onMounted(async () => {
  const data = await run(() => fetchProviderWallet());
  if (data) {
    overview.value = data.overview;
    ledger.value = data.ledger;
    account.value = data.account;
  }
});
</script>

<template>
  <div class="page">
    <header>
      <h1 class="page-title">我的钱包</h1>
      <p class="page-subtitle">T+1 提现 · 免手续费 · 提现需完成实名并签署灵活用工结算协议</p>
    </header>

    <SkeletonBlock v-if="isLoading || !overview" preset="table" />

    <div v-else class="page__cols">
      <div class="page__stack">
        <section class="balance-card">
          <p class="balance-card__label">可提现（已扣服务费与个税）</p>
          <p class="price balance-card__value">{{ formatCurrency(overview.mainCents) }}</p>
          <div class="balance-card__ops">
            <button class="btn btn--white" @click="openWithdraw">立即提现</button>
            <button class="btn btn--white" @click="toast('演示原型：打开完税凭证列表')">完税凭证</button>
          </div>
        </section>

        <section class="card">
          <div class="stat-line">
            <div><b class="page__teal">{{ formatCurrency(overview.escrowCents) }}</b><span>托管中</span></div>
            <div><b>{{ formatCurrency(overview.secondaryCents) }}</b><span>累计完税收入</span></div>
            <div><b>{{ formatCurrency(overview.tertiaryCents) }}</b><span>本月代征个税</span></div>
          </div>
        </section>

        <p class="escrow-note">
          <span>🛡</span>
          <span>托管中资金验收后自动分账，<b>无需催款</b>；分账失败将转人工追偿并扣发信用分。</span>
        </p>
      </div>

      <section class="card page__table">
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
              <td><StatusTag :label="item.statusLabel" :tone="item.tone === 'success' ? 'success' : item.tone === 'teal' ? 'teal' : 'plain'" /></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <BaseModal
      v-model:open="isWithdrawOpen"
      title="提现"
      :subtitle="`可提现 ${overview ? formatCurrency(overview.mainCents) : ''} · T+1 到账`"
      @close="isWithdrawOpen = false"
    >
      <div class="field">
        <label>提现金额（元）</label>
        <input v-model.number="amountYuan" type="number" min="1" />
      </div>
      <div class="field">
        <label>到账账户</label>
        <div class="card card--flat account">
          <span class="account__mark">{{ account?.bankName.slice(0, 1) }}</span>
          <div>
            <b>{{ account?.bankName }} · {{ account?.maskedCardNo }}</b>
            <p class="muted">{{ account?.holderName }} · 与实名信息一致 {{ account?.isVerified ? '✓' : '✗' }}</p>
          </div>
        </div>
      </div>
      <p class="hint-box">提现需完成实名认证并签署灵活用工结算协议；提现即视为确认当期收入完税。</p>

      <template #footer>
        <button class="btn btn--ghost" @click="isWithdrawOpen = false">取消</button>
        <button class="btn btn--primary" :class="{ 'btn--loading': isSubmitting }" @click="handleWithdraw">
          <span v-if="isSubmitting" class="spin" />
          {{ isSubmitting ? '处理中…' : '确认提现' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.page {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.page__cols {
  display: grid;
  grid-template-columns: 25rem 1fr;
  gap: $space-5;
  align-items: start;
}

.page__stack {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.page__table {
  padding: 0;
  overflow: hidden;
}

.balance-card {
  padding: $space-6;
  border-radius: $radius-lg;
  color: #fff;
  background: linear-gradient(135deg, $color-accent-deep, #9a2f10);

  b {
    color: #fff;
  }
}

.balance-card__label {
  font-size: $fs-sm;
  color: rgba(255, 235, 225, 0.85);
}

.balance-card__value {
  margin-top: $space-2;
  font-size: 2.125rem;
}

.balance-card__ops {
  display: flex;
  gap: $space-3;
  margin-top: $space-5;
}

.page__teal {
  color: $color-teal;
}

.page__plus {
  color: $color-success;
}

.account {
  display: flex;
  align-items: center;
  gap: $space-4;

  b {
    display: block;
    font-size: $fs-base;
  }
}

.account__mark {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: $radius-sm;
  background: $color-accent-soft;
  color: $color-accent-deep;
  font-weight: 800;
}
</style>
