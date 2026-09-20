<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { publishDemand } from '@/api/demand';
import { fetchDemanderOrders, fetchDemanderStats } from '@/api/order';
import BaseModal from '@/components/BaseModal.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatCard from '@/components/StatCard.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { CATEGORIES } from '@/constants';
import { useUserStore } from '@/store/user';
import type { IStatItemType } from '@/types/common';
import type { IOrderType } from '@/types/order';

interface IPublishFormType {
  category: string;
  title: string;
  description: string;
  budgetYuan: number;
  cycleLabel: string;
  acceptance: string;
}

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const toast = useToast();
const { isLoading, isSubmitting, run, runAction } = useAsync();

const stats = ref<IStatItemType[]>([]);
const orders = ref<IOrderType[]>([]);
const isPublishOpen = ref(false);

const form = reactive<IPublishFormType>({
  category: 'design',
  title: '品牌视觉升级 · 主视觉+菜单系统',
  description:
    '背景：山野咖啡 3 家新店 11 月开业。\n目标：Logo 微调升级 + 主视觉 + 三店通用菜单系统。\n参考资料：现有 VI 手册与新店空间照片已上传。',
  budgetYuan: 6800,
  cycleLabel: '2–4 周',
  acceptance: '1. 主视觉通过店内实拍验证效果；\n2. 菜单系统覆盖早/晚市两套价目；\n3. 源文件含分层工程文件与字体授权清单。',
});

const activeOrders = computed(() =>
  orders.value.filter((order) => ['ongoing', 'accepting'].includes(order.status)),
);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

async function loadPage(): Promise<void> {
  const [statList, orderList] = await Promise.all([
    run(() => fetchDemanderStats()),
    run(() => fetchDemanderOrders()),
  ]);
  stats.value = statList ?? [];
  orders.value = orderList ?? [];
}

function openPublish(): void {
  isPublishOpen.value = true;
}

async function handlePublish(): Promise<void> {
  const isSaved = await runAction(() =>
    publishDemand({ title: form.title, budgetCents: Math.round(form.budgetYuan * 100) }),
  );
  if (!isSaved) {
    return;
  }
  isPublishOpen.value = false;
  toast('已提交审核，预计 2 小时内上架抢单大厅', 'success');
}

onMounted(() => {
  void loadPage();
  if (route.query.publish === '1') {
    openPublish();
  }
});
</script>

<template>
  <div class="page">
    <SkeletonBlock v-if="isLoading" preset="dash" />

    <template v-else>
      <header class="page__head">
        <div>
          <h1 class="page-title">{{ greeting }}，{{ user.isDemander ? '唐总' : '林一舟' }}</h1>
          <p class="page-subtitle">
            山野咖啡品牌部 · <StatusTag label="认证企业" tone="accent" /> · 3 家新店 11 月开业
          </p>
        </div>
        <span class="muted">上次登录 {{ new Date().toLocaleDateString('zh-CN') }} · 安全状态正常</span>
      </header>

      <section class="page__stats" aria-label="关键指标">
        <StatCard v-for="item in stats" :key="item.id" :item="item" />
      </section>

      <section class="cta-banner">
        <div>
          <b>把下一个需求交给认证 OPC</b>
          <p>结构化发单 · 机审+人审约 2 小时 · 平均当日收到 5+ 份投标 · 全程资金托管</p>
        </div>
        <button class="btn btn--lg cta-banner__btn" @click="openPublish">发布需求 →</button>
      </section>

      <section class="page__section">
        <div class="section-head">
          <b>进行中的订单</b>
          <RouterLink to="/demand/orders" class="muted page__link">全部发布 ›</RouterLink>
        </div>

        <div class="card page__table">
          <table class="table">
            <thead>
              <tr>
                <th>订单</th>
                <th>从业者</th>
                <th>金额</th>
                <th>进度</th>
                <th>状态</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in activeOrders" :key="order.id" @click="router.push(`/demand/orders/${order.id}`)">
                <td>
                  <p class="table__title">{{ order.demandTitle }}</p>
                  <p class="muted">{{ order.orderNo }} · 里程碑 {{ order.milestones.filter((m) => m.status === 'paid').length }}/{{ order.milestones.length }}</p>
                </td>
                <td>
                  <span class="page__person">
                    <UserAvatar :letter="order.counterpartyLetter" :tone="order.counterpartyAvatarTone" :size="1.875" />
                    {{ order.counterpartyName }}
                    <StatusTag v-if="order.counterpartyVerified" label="认证OPC" tone="accent" />
                  </span>
                </td>
                <td class="price">¥{{ Math.round(order.totalCents / 100).toLocaleString('zh-CN') }}</td>
                <td class="page__progress">
                  <span class="progress"><i :style="{ width: `${order.progressPercent}%` }" /></span>
                  <em class="muted">{{ order.progressPercent }}%</em>
                </td>
                <td>
                  <StatusTag :label="order.status === 'accepting' ? '待验收' : '进行中'" :tone="order.status === 'accepting' ? 'warning' : 'teal'" />
                </td>
                <td>
                  <button
                    :class="['btn', 'btn--sm', order.status === 'accepting' ? 'btn--primary' : 'btn--ghost']"
                    @click.stop="router.push(`/demand/orders/${order.id}`)"
                  >
                    {{ order.status === 'accepting' ? '去验收' : '查看详情' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="page__section">
        <div class="section-head">
          <b>我的需求</b>
          <span class="muted">管理全部 ›</span>
        </div>
        <div class="page__demands">
          <article class="card page__demand" @click="router.push('/demand/bids/d-9')">
            <div class="page__demand-head">
              <b>抖音短视频 15 条 · 剪辑+脚本</b>
              <StatusTag label="选人中" tone="accent" />
            </div>
            <p class="muted">预算 ¥4,000–6,000 · 周期 3 周 · 已收 5 份投标，48 小时答复窗口剩 31 小时</p>
          </article>
          <article class="card page__demand" @click="toast('演示原型：打开已完成需求')">
            <div class="page__demand-head">
              <b>门店菜单重设计</b>
              <StatusTag label="已完成" tone="success" />
            </div>
            <p class="muted">成交价 ¥1,800 · 双方已互评 · 14 天售后窗口剩余 6 天</p>
          </article>
        </div>
      </section>

      <p class="escrow-note">
        <span>🛡</span>
        <span>新需求通过机审+人审后自动进入抢单大厅；沟通全程站内留痕，联系方式受平台保护。</span>
      </p>
    </template>

    <BaseModal
      v-model:open="isPublishOpen"
      title="发布需求"
      subtitle="机审+人审约 2 小时 · 审核通过前不收费"
      wide
      @close="isPublishOpen = false"
    >
      <div class="publish">
        <div class="publish__form">
          <div class="field">
            <label>需求品类</label>
            <div class="chip-row">
              <button
                v-for="category in CATEGORIES"
                :key="category.value"
                :class="['chip', { 'chip--on': form.category === category.value }]"
                @click="form.category = category.value"
              >
                {{ category.label }}
              </button>
            </div>
          </div>
          <div class="field">
            <label>需求标题</label>
            <input v-model="form.title" placeholder="一句话说清要做什么" maxlength="60" />
          </div>
          <div class="field">
            <label>需求描述 <em>完整度影响匹配质量评分</em></label>
            <textarea v-model="form.description" rows="5" />
          </div>
          <div class="field-row">
            <div class="field">
              <label>预算（元）</label>
              <input v-model.number="form.budgetYuan" type="number" min="100" />
            </div>
            <div class="field">
              <label>期望周期</label>
              <select v-model="form.cycleLabel">
                <option>1 周内</option>
                <option>2–4 周</option>
                <option>1 个月以上</option>
              </select>
            </div>
          </div>
          <div class="field field--last">
            <label>验收标准 <em>必填 · 纠纷仲裁的首要依据</em></label>
            <textarea v-model="form.acceptance" rows="4" />
          </div>
        </div>

        <aside class="publish__aside">
          <b>发布须知</b>
          <p class="muted">
            · 违禁品类与联系方式检测：机审拦截 + 人工复审<br />
            · 高预算（≥2 万）与新账号首单必人工复审<br />
            · 资金在你选定人选下单时才托管，发布免费<br />
            · 选定人选后平台生成电子合同并引导付款
          </p>
          <p class="hint-box">指导价参考：设计类 ¥800–3,000/项。过低预算会被限制上架。</p>
          <button
            class="btn btn--primary btn--block"
            :class="{ 'btn--loading': isSubmitting }"
            @click="handlePublish"
          >
            <span v-if="isSubmitting" class="spin" />
            {{ isSubmitting ? '提交中…' : '提交审核' }}
          </button>
          <button class="btn btn--ghost btn--block" @click="toast('已存草稿')">存草稿</button>
        </aside>
      </div>
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

.page__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-4;
  flex-wrap: wrap;
}

.page__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
}

.page__section {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.page__link:hover {
  color: $color-accent-deep;
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
    font-style: normal;
    display: block;
    margin-top: $space-1;
  }
}

.page__demands {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;
}

.page__demand {
  cursor: pointer;
  transition: transform $duration-fast $ease-out, box-shadow $duration-fast;

  &:hover {
    transform: translateY(-0.125rem);
    box-shadow: $shadow-float;
  }
}

.page__demand-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;

  b {
    font-size: $fs-md;
  }
}

.cta-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-5;
  padding: $space-6 $space-7;
  border-radius: $radius-xl;
  color: $color-on-accent;
  background: linear-gradient(120deg, #b93a18 0%, $color-accent 55%, #d14a22 100%);
  box-shadow: 0 1rem 2.25rem -1rem $color-accent-glow;

  b {
    display: block;
    font-size: $fs-xl;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  p {
    margin-top: $space-2;
    font-size: $fs-sm;
    opacity: 0.86;
  }
}

.cta-banner__btn {
  background: rgba(255, 255, 255, 0.18);
  color: $color-on-accent;
  flex: none;
}

.publish {
  display: grid;
  grid-template-columns: 1fr 17.5rem;
  gap: $space-6;
}

.publish__aside {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding-left: $space-5;
  border-left: 0.0625rem solid $color-border;

  b {
    font-size: $fs-base;
  }
}

.field--last {
  margin-bottom: 0;
}

@media (max-width: 62.5rem) {
  .page__stats,
  .page__demands {
    grid-template-columns: 1fr 1fr;
  }

  .publish {
    grid-template-columns: 1fr;
  }
}
</style>
