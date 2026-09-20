<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { acceptMilestone, rejectMilestone, fetchOrderDetail } from '@/api/order';
import BaseModal from '@/components/BaseModal.vue';
import EmptyState from '@/components/EmptyState.vue';
import MilestoneTimeline from '@/components/MilestoneTimeline.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { MAX_REJECT_COUNT, ORDER_STATUS_TEXT } from '@/constants';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatCurrency } from '@/utils/format';
import type { IMilestoneType, IOrderType } from '@/types/order';

const REJECT_REASONS = ['与验收标准不符', '缺少约定交付物', '风格偏离确认稿'] as const;

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { isLoading, isSubmitting, run, runAction } = useAsync();

const order = ref<IOrderType | null>(null);
const isVerifyOpen = ref(false);
const activeMilestone = ref<IMilestoneType | null>(null);
const rejectReason = ref('');
const selectedReason = ref<string>('');

const netPayoutCents = computed(() => {
  const milestone = activeMilestone.value;
  if (!milestone) {
    return 0;
  }
  return Math.round(milestone.amountCents * 0.9);
});

async function loadDetail(): Promise<void> {
  order.value = await run(() => fetchOrderDetail(String(route.params.id)));
}

function openVerify(milestone: IMilestoneType): void {
  activeMilestone.value = milestone;
  rejectReason.value = '';
  selectedReason.value = '';
  isVerifyOpen.value = true;
}

async function handleAccept(): Promise<void> {
  if (!order.value || !activeMilestone.value) return;
  const orderId = order.value.id;
  const milestoneId = activeMilestone.value.id;
  const isDone = await runAction(() => acceptMilestone(orderId, milestoneId));
  if (!isDone) return;
  isVerifyOpen.value = false;
  toast(`验收通过！${formatCurrency(activeMilestone.value?.amountCents ?? 0)} 已放款分账`, 'success');
  await loadDetail();
}

async function handleReject(): Promise<void> {
  if (!order.value || !activeMilestone.value) return;
  const reason = `${selectedReason.value ? `${selectedReason.value}：` : ''}${rejectReason.value}`;
  const isDone = await runAction(() => rejectMilestone(order.value!.id, activeMilestone.value!.id, reason));
  if (!isDone) return;
  isVerifyOpen.value = false;
  toast(`已驳回并通知对方整改（1/${MAX_REJECT_COUNT}）`);
  await loadDetail();
}

onMounted(loadDetail);
</script>

<template>
  <div class="page">
    <SkeletonBlock v-if="isLoading" preset="table" />

    <EmptyState v-else-if="!order" text="订单不存在或已删除" />

    <template v-else>
      <header class="page__head">
        <div>
          <h1 class="page-title">{{ order.demandTitle }}</h1>
          <p class="page-subtitle">
            编号 {{ order.orderNo }} · {{ order.createdAt.slice(5, 10) }} 创建 ·
            <StatusTag
              :label="ORDER_STATUS_TEXT[order.status]?.label ?? order.status"
              :tone="order.status === 'accepting' ? 'warning' : 'teal'"
            />
          </p>
        </div>
        <div class="page__head-ops">
          <button class="btn btn--ghost" @click="router.push('/chat')">联系对方</button>
          <button class="btn btn--ghost" @click="toast('已申请平台介入，争议里程碑款项冻结中')">平台介入</button>
        </div>
      </header>

      <div class="page__cols">
        <section class="page__main">
          <article class="card">
            <MilestoneTimeline :milestones="order.milestones" perspective="demander" @verify="openVerify" />
          </article>

          <p class="escrow-note">
            <span>🛡</span>
            <span>
              <b>资金由持牌支付机构托管</b>，平台不经手货款。验收通过后系统自动分账：90% 给从业者、10% 为平台服务费；
              争议期间款项冻结，由平台依订单留痕仲裁。退款原路退回。
            </span>
          </p>
        </section>

        <aside class="page__aside">
          <article class="card">
            <div class="page__person-row">
              <UserAvatar :letter="order.counterpartyLetter" :tone="order.counterpartyAvatarTone" :size="2.875" />
              <div>
                <b>{{ order.counterpartyName }}</b>
                <p><StatusTag label="认证OPC · L2" tone="accent" /></p>
              </div>
            </div>
            <div class="stat-line page__stats">
              <div><b>912</b><span>信用分</span></div>
              <div><b>47</b><span>完单</span></div>
              <div><b>98%</b><span>好评率</span></div>
            </div>
            <p class="muted">品牌视觉设计师 · 7 年 · 与你合作 3 次，复购关系</p>
          </article>

          <article class="card">
            <b class="page__card-title">订单资金</b>
            <div class="stat-line">
              <div><b>{{ formatCurrency(order.totalCents) }}</b><span>订单总额</span></div>
              <div><b class="page__teal">{{ formatCurrency(order.escrowCents) }}</b><span>托管中</span></div>
              <div><b class="page__green">{{ formatCurrency(order.releasedCents) }}</b><span>已放款</span></div>
            </div>
            <p class="muted page__note">
              支付方式：支付宝预授权托管 · 流水可导出对账；本单服务费发票已开具 6% 增值税专票。
            </p>
          </article>

          <article class="card">
            <b class="page__card-title">电子合同</b>
            <p class="muted page__note">
              《服务承揽协议》双方已签署 · e签宝存证<br />
              里程碑条款与验收标准已固化进合同附件
            </p>
            <button class="btn btn--ghost btn--sm" @click="toast('演示原型：下载合同 PDF')">下载合同</button>
          </article>
        </aside>
      </div>

      <BaseModal
        v-model:open="isVerifyOpen"
        title="验收处理"
        :subtitle="`通过后放款 ${formatCurrency(activeMilestone?.amountCents ?? 0)}（分账 ${formatCurrency(netPayoutCents)} + 服务费 ${formatCurrency((activeMilestone?.amountCents ?? 0) - netPayoutCents)}）`"
        @close="isVerifyOpen = false"
      >
        <p class="hint-box">
          已交付 {{ activeMilestone?.deliverableSummary || '6 个文件' }}（预览含水印）。验收通过后自动交付无水印源文件。
        </p>

        <div class="field verify__reason">
          <label>若驳回，必须填写整改要求 <em>仲裁依据</em></label>
          <div class="chip-row">
            <button
              v-for="reason in REJECT_REASONS"
              :key="reason"
              :class="['chip', { 'chip--on': selectedReason === reason }]"
              @click="selectedReason = reason"
            >
              {{ reason }}
            </button>
          </div>
          <textarea v-model="rejectReason" rows="3" placeholder="具体说明需要修改的内容与位置…" />
        </div>

        <template #footer>
          <button class="btn btn--ghost" :class="{ 'btn--loading': isSubmitting }" @click="handleReject">
            驳回整改
          </button>
          <button class="btn btn--primary" :class="{ 'btn--loading': isSubmitting }" @click="handleAccept">
            <span v-if="isSubmitting" class="spin" />
            {{ isSubmitting ? '处理中…' : '验收通过' }}
          </button>
        </template>
      </BaseModal>
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

.page__main {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.page__aside {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.page__person-row {
  display: flex;
  align-items: center;
  gap: $space-4;

  b {
    font-size: $fs-md;
  }
}

.page__stats {
  margin-top: $space-4;
  padding-top: $space-4;
  border-top: 0.0625rem solid $color-border;
}

.page__card-title {
  display: block;
  margin-bottom: $space-4;
  font-size: $fs-md;
}

.page__teal {
  color: $color-teal;
}

.page__green {
  color: $color-success;
}

.page__note {
  margin-top: $space-3;
  line-height: 1.8;
}

.verify__reason {
  margin-top: $space-5;
  margin-bottom: 0;

  textarea {
    margin-top: $space-3;
  }
}
</style>
