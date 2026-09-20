<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { fetchDemandDetail, submitBid } from '@/api/demand';
import BaseModal from '@/components/BaseModal.vue';
import EmptyState from '@/components/EmptyState.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { CATEGORIES, MILESTONE_SPLIT } from '@/constants';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatCurrency, formatDate, formatHoursToDays } from '@/utils/format';
import type { IDemandType } from '@/types/demand';

interface IBidFormType {
  priceYuan: number;
  schedule: string;
  proposal: string;
}

/** 投标答复窗口（小时） */
const BID_REPLY_WINDOW_HOURS = 48;

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { isLoading, isSubmitting, run, runAction } = useAsync();

const demand = ref<IDemandType | null>(null);
const isBidOpen = ref(false);

const form = reactive<IBidFormType>({
  priceYuan: 0,
  schedule: '3 周',
  proposal: '',
});

const categoryLabel = computed(
  () => CATEGORIES.find((item) => item.value === demand.value?.category)?.label ?? '—',
);

const milestoneHints = computed(() => {
  if (!demand.value) {
    return [];
  }
  return MILESTONE_SPLIT.map((ratio, index) => ({
    seq: index + 1,
    ratio: Math.round(ratio * 100),
    amountCents: Math.round(demand.value!.budgetCents * ratio),
  }));
});

async function loadDetail(): Promise<void> {
  demand.value = await run(() => fetchDemandDetail(String(route.params.id)));
  if (demand.value) {
    form.priceYuan = Math.round(demand.value.budgetCents / 100);
    form.proposal = `针对「${demand.value.title}」，我计划先出情绪板对齐方向，再按里程碑交付：${demand.value.deliverables.join('、')}。`;
  }
}

function openBid(): void {
  isBidOpen.value = true;
}

async function handleSubmitBid(): Promise<void> {
  if (!demand.value) {
    return;
  }
  const demandId = demand.value.id;
  const isDone = await runAction(() => submitBid(demandId, Math.round(form.priceYuan * 100)));
  if (!isDone) {
    toast('投标未提交，请检查报价与方案', 'error');
    return;
  }
  isBidOpen.value = false;
  toast('投标成功！需求方将在 48 小时内答复', 'success');
  await loadDetail();
}

onMounted(loadDetail);
</script>

<template>
  <div class="detail">
    <button class="detail__back" @click="router.push('/provider/hall')">‹ 返回抢单大厅</button>

    <SkeletonBlock v-if="isLoading" preset="table" />

    <EmptyState v-else-if="!demand" text="该需求已下架或不存在" />

    <template v-else>
      <header class="detail__head card">
        <div class="detail__head-main">
          <h1 class="detail__title">{{ demand.title }}</h1>
          <div class="detail__tags">
            <StatusTag :label="categoryLabel" tone="plain" />
            <StatusTag v-if="demand.isEnterpriseVerified" label="已认证企业" tone="accent" />
            <StatusTag v-if="demand.requiresCertifiedOpc" label="仅认证OPC" tone="warning" />
            <StatusTag label="机审+人审已通过" tone="teal" />
          </div>
          <p class="muted detail__meta">
            发布于 {{ formatDate(demand.publishedAt) }} · 浏览 {{ demand.viewCount ?? '—' }} 次 ·
            已投 {{ demand.bidCount }} 人 · 答复窗口剩
            {{ formatHoursToDays(BID_REPLY_WINDOW_HOURS - 17) }}
          </p>
        </div>
        <div class="detail__head-price">
          <p class="muted">{{ demand.budgetMode === 'fixed' ? '一口价预算' : '预算区间' }}</p>
          <p class="price detail__price">{{ formatCurrency(demand.budgetCents) }}</p>
          <p class="muted">{{ demand.budgetRangeLabel }}</p>
        </div>
      </header>

      <div class="detail__cols">
        <div class="detail__stack">
          <section class="card">
            <b class="card-title">需求描述</b>
            <p class="detail__desc">{{ demand.description }}</p>
            <p class="muted detail__extra">
              背景与资料由企业随需求一并上传，投标前可在会话内向需求方发起一次澄清沟通；
              平台对沟通内容做联系方式保护与留痕。
            </p>
          </section>

          <section class="card">
            <b class="card-title">交付物清单</b>
            <div class="chip-row">
              <span v-for="item in demand.deliverables" :key="item" class="tag tag--plain">{{ item }}</span>
            </div>
            <b class="card-title card-title--sub">验收标准 <span class="muted">企业必填 · 仲裁首要依据</span></b>
            <ol class="detail__accept">
              <li v-for="item in demand.acceptance" :key="item">{{ item }}</li>
            </ol>
          </section>

          <section class="card">
            <b class="card-title">建议里程碑</b>
            <p class="muted detail__split-hint">
              本单预算 ≥ ¥3,000，平台建议按 {{ milestoneHints.map((m) => m.ratio + '%').join(' / ') }}
              拆分交付，每个里程碑独立验收与放款，降低双方风险。
            </p>
            <ul class="detail__split">
              <li v-for="item in milestoneHints" :key="item.seq">
                <span class="detail__split-seq">M{{ item.seq }}</span>
                <span class="detail__split-ratio">{{ item.ratio }}%</span>
                <span class="price detail__split-amount">{{ formatCurrency(item.amountCents) }}</span>
              </li>
            </ul>
          </section>

          <section class="card">
            <b class="card-title">技能匹配要求</b>
            <div class="chip-row">
              <span
                v-for="skill in demand.requiredSkills ?? [categoryLabel]"
                :key="skill"
                class="tag tag--plain"
              >
                {{ skill }}
              </span>
            </div>
            <p class="muted detail__match">
              与你主页的「品牌VI / 菜单物料 / 包装」标签高度匹配，投标后预计进入需求方首选名单。
            </p>
          </section>
        </div>

        <aside class="detail__stack">
          <section class="card">
            <b class="card-title">发布企业</b>
            <div class="detail__ent">
              <UserAvatar :letter="demand.enterpriseName.slice(0, 1)" tone="av-2" :size="2.75" />
              <div>
                <p class="detail__ent-name">
                  <b>{{ demand.enterpriseName }}</b>
                  <StatusTag v-if="demand.isEnterpriseVerified" label="认证企业" tone="accent" />
                </p>
                <p class="muted">
                  累计发布 {{ demand.enterpriseDemandCount ?? '—' }} 个需求 · 验收平均 1.2 天 · 付款爽快度 4.9
                </p>
              </div>
            </div>
          </section>

          <section class="card">
            <b class="card-title">项目要素</b>
            <dl class="detail__facts">
              <div><dt>预算</dt><dd class="price">{{ formatCurrency(demand.budgetCents) }}</dd></div>
              <div><dt>周期</dt><dd>{{ demand.cycleDays }} 天</dd></div>
              <div><dt>交付物</dt><dd>{{ demand.deliverables.length }} 项</dd></div>
              <div><dt>已投标</dt><dd>{{ demand.bidCount }} 人</dd></div>
            </dl>
          </section>

          <section class="action-card">
            <button class="btn btn--lg btn--block action-card__bid" @click="openBid">立即投标</button>
            <button class="btn btn--lg btn--block action-card__fav" @click="toast('已收藏该需求，新动态将站内提醒')">
              收藏需求
            </button>
            <p class="action-card__note">每人限投 1 次 · 需求方 48 小时内答复 · 落选会收到原因反馈</p>
          </section>

          <p class="escrow-note">
            <span>🛡</span>
            <span>中标后走同一份电子合同与支付宝预授权托管，验收通过自动分账；请勿引导线下交易，站外成交不受平台保障。</span>
          </p>
        </aside>
      </div>

      <BaseModal
        v-model:open="isBidOpen"
        title="提交投标"
        :subtitle="`${demand.title} · 每人限投 1 次`"
        @close="isBidOpen = false"
      >
        <div class="field">
          <label>报价（元）<em>企业预算 {{ formatCurrency(demand.budgetCents) }}</em></label>
          <input v-model.number="form.priceYuan" type="number" min="100" />
        </div>
        <div class="field">
          <label>预计排期</label>
          <div class="chip-row">
            <button
              v-for="option in ['1 周', '3 周', '1 个月以上']"
              :key="option"
              :class="['chip', { 'chip--on': form.schedule === option }]"
              @click="form.schedule = option"
            >
              {{ option }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>方案摘要</label>
          <textarea v-model="form.proposal" rows="4" maxlength="500" />
        </div>

        <template #footer>
          <button class="btn btn--ghost" @click="isBidOpen = false">取消</button>
          <button class="btn btn--primary" :class="{ 'btn--loading': isSubmitting }" @click="handleSubmitBid">
            <span v-if="isSubmitting" class="spin" />
            {{ isSubmitting ? '提交中…' : '提交投标' }}
          </button>
        </template>
      </BaseModal>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.detail {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.detail__back {
  align-self: flex-start;
  font-size: $fs-sm;
  font-weight: 600;
  color: $color-ink-3;
  transition: color $duration-fast;

  &:hover {
    color: $color-accent-deep;
  }
}

.detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-6;
  padding: $space-6;
}

.detail__title {
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.35;
}

.detail__tags {
  display: flex;
  gap: $space-2;
  flex-wrap: wrap;
  margin-top: $space-3;
}

.detail__meta {
  margin-top: $space-3;
}

.detail__head-price {
  flex: none;
  text-align: right;
}

.detail__price {
  font-size: 1.75rem;
  color: $color-accent-deep;
}

.detail__cols {
  display: grid;
  grid-template-columns: 1fr 21.25rem;
  gap: $space-5;
  align-items: start;
}

.detail__stack {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.card-title {
  display: block;
  margin-bottom: $space-4;
  font-size: $fs-md;

  &--sub {
    margin-top: $space-5;
  }

  .muted {
    font-weight: 400;
    font-size: $fs-xs;
  }
}

.detail__desc {
  font-size: $fs-base;
  line-height: 1.8;
}

.detail__extra {
  margin-top: $space-3;
  line-height: 1.7;
}

.detail__accept {
  padding-left: 1.25rem;
  list-style: decimal;
  font-size: $fs-base;
  line-height: 1.9;
  color: $color-ink-2;
}

.detail__split-hint {
  line-height: 1.7;
  margin-bottom: $space-3;
}

.detail__split {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-3;
}

.detail__split li {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  padding: $space-3 $space-4;
  border-radius: $radius-md;
  background: $color-panel;
}

.detail__split-seq {
  font-size: $fs-xs;
  font-weight: 700;
  color: $color-ink-3;
}

.detail__split-ratio {
  font-size: $fs-xs;
  color: $color-accent-deep;
  font-weight: 700;
}

.detail__split-amount {
  font-size: $fs-md;
}

.detail__match {
  margin-top: $space-3;
  line-height: 1.7;
}

.detail__ent {
  display: flex;
  gap: $space-4;
  align-items: flex-start;
}

.detail__ent-name {
  display: flex;
  align-items: center;
  gap: $space-2;

  b {
    font-size: $fs-md;
  }
}

.detail__facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;

  dt {
    font-size: $fs-xs;
    color: $color-ink-3;
  }

  dd {
    font-size: $fs-md;
    font-weight: 800;
    margin: $space-1 0 0;
  }
}

.action-card {
  padding: $space-5;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, $color-accent-deep, #9a2f10);
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.action-card__bid {
  background: #fff;
  color: $color-accent-deep;
}

.action-card__fav {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.action-card__note {
  font-size: $fs-xs;
  color: rgba(255, 235, 225, 0.8);
  line-height: 1.6;
}
</style>
