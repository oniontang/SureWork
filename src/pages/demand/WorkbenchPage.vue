<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { fetchQuickRefine } from '@/api/ai';
import { publishDemand } from '@/api/demand';
import { fetchDemanderOrders, fetchDemanderStats } from '@/api/order';
import AiRefinePanel from '@/components/AiRefinePanel.vue';
import BaseModal from '@/components/BaseModal.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatCard from '@/components/StatCard.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import {
  AI_REFINE_MIN_TEXT_LENGTH,
  CATEGORIES,
  DEFAULT_BID_MANAGE_DEMAND_ID,
  QUALITY_SUBMIT_THRESHOLD,
} from '@/constants';
import { useUserStore } from '@/store/user';
import { isValidAmount } from '@/utils/validate';
import type { IRefineApplyType, IQuickRefineResultType } from '@/types/ai';
import type { IDemandDraftType } from '@/types/demand';
import type { IStatItemType } from '@/types/common';
import type { IOrderType } from '@/types/order';

interface IPublishFormType {
  category: string;
  title: string;
  description: string;
  deliverables: string[];
  budgetYuan: number;
  cycleLabel: string;
  acceptance: string;
}

/** 周期文案 → 天数，供 AI 细化与质量评估使用 */
const CYCLE_DAYS_MAP: Record<string, number> = {
  '1 周内': 7,
  '2–4 周': 21,
  '1 个月以上': 45,
};

/** 未细化时，描述短于此长度视为信息量不足，提示先做 AI 细化 */
const THIN_DESCRIPTION_LENGTH = 80;

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const toast = useToast();
const { isLoading, isSubmitting, error, run, runAction } = useAsync();

const stats = ref<IStatItemType[]>([]);
const orders = ref<IOrderType[]>([]);
const isPublishOpen = ref(false);
const isRefineOpen = ref(false);
const qualityScore = ref<number | null>(null);
const isRefineHintOn = ref(false);
const isRefining = ref(false);
const refineResult = ref<IQuickRefineResultType | null>(null);
const isDiffOpen = ref(false);

/** 细化前的原文快照，用于撤销与 diff 对照 */
interface IDraftSnapshotType {
  description: string;
  deliverables: string[];
  acceptance: string;
}
const originalSnapshot = ref<IDraftSnapshotType | null>(null);

const form = reactive<IPublishFormType>({
  category: 'design',
  title: '品牌视觉升级 · 主视觉+菜单系统',
  description:
    '背景：山野咖啡 3 家新店 11 月开业。\n目标：Logo 微调升级 + 主视觉 + 三店通用菜单系统。\n参考资料：现有 VI 手册与新店空间照片已上传。',
  deliverables: ['源文件', '使用规范'],
  budgetYuan: 6800,
  cycleLabel: '2–4 周',
  acceptance: '1. 主视觉通过店内实拍验证效果；\n2. 菜单系统覆盖早/晚市两套价目；\n3. 源文件含分层工程文件与字体授权清单。',
});

const isRefined = computed(() => qualityScore.value !== null);

/** 已细化但仍未达提交质量线 */
const isLowQuality = computed(
  () => qualityScore.value !== null && qualityScore.value < QUALITY_SUBMIT_THRESHOLD,
);

/** 描述有足够内容后才出现「细化需求」入口，避免空表单点进去没东西可分析 */
const canRefine = computed(
  () => form.description.trim().length >= AI_REFINE_MIN_TEXT_LENGTH,
);

/** 传给细化面板的草稿快照 */
const refineDraft = computed<IDemandDraftType>(() => ({
  title: form.title,
  description: form.description,
  deliverables: [...form.deliverables],
  acceptance: form.acceptance
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
  budgetCents: Math.round(Number(form.budgetYuan) * 100),
  cycleDays: CYCLE_DAYS_MAP[form.cycleLabel] ?? 21,
  category: form.category,
}));

/** 主路径：AI 补全用户已写的内容，直接填回原输入框 */
async function handleQuickRefine(): Promise<void> {
  if (isRefining.value) {
    return;
  }
  isRefining.value = true;
  const snapshot: IDraftSnapshotType = {
    description: form.description,
    deliverables: [...form.deliverables],
    acceptance: form.acceptance,
  };
  const result = await run(() => fetchQuickRefine(refineDraft.value), { skeleton: false });
  isRefining.value = false;

  if (!result) {
    toast(error.value ?? '细化失败，请稍后重试', 'error');
    return;
  }

  // 只保留最早的一份原文，重复细化后撤销仍能回到用户手写内容
  if (!originalSnapshot.value) {
    originalSnapshot.value = snapshot;
  }
  form.description = result.description;
  result.deliverables.forEach((item) => {
    if (!form.deliverables.includes(item)) {
      form.deliverables.push(item);
    }
  });
  if (result.acceptance.length > 0) {
    form.acceptance = [form.acceptance.trim(), ...result.acceptance].filter(Boolean).join('\n');
  }
  refineResult.value = result;
  qualityScore.value = result.qualityScore;
  isRefineHintOn.value = false;
  toast('AI 已完善需求内容并填入输入框', 'success');
}

function handleUndoRefine(): void {
  const snapshot = originalSnapshot.value;
  if (!snapshot) {
    return;
  }
  form.description = snapshot.description;
  form.deliverables = [...snapshot.deliverables];
  form.acceptance = snapshot.acceptance;
  originalSnapshot.value = null;
  refineResult.value = null;
  qualityScore.value = null;
  isDiffOpen.value = false;
  toast('已恢复到细化前的内容');
}

/** 把采纳结果写回表单（AI 不直接覆盖，只按用户采纳的条目回填） */
function handleApplyRefine(payload: IRefineApplyType): void {
  const { draft } = payload;
  if (!originalSnapshot.value) {
    originalSnapshot.value = {
      description: form.description,
      deliverables: [...form.deliverables],
      acceptance: form.acceptance,
    };
  }
  if (draft.description) {
    form.description = draft.description;
  }
  if (draft.deliverables) {
    form.deliverables = draft.deliverables;
  }
  if (draft.acceptance?.length) {
    const existing = form.acceptance.trim();
    form.acceptance = [existing, ...draft.acceptance].filter(Boolean).join('\n');
  }
  if (draft.budgetCents) {
    form.budgetYuan = Math.round(draft.budgetCents / 100);
  }
  qualityScore.value = payload.qualityScore;
  refineResult.value = {
    description: form.description,
    acceptance: [],
    deliverables: [],
    changes: [`已按你的选择应用 ${payload.acceptedCount} 条建议`],
    qualityScore: payload.qualityScore,
  };
  isRefineHintOn.value = false;
  toast(`已应用 ${payload.acceptedCount} 条 AI 建议，需求质量分 ${payload.qualityScore}`, 'success');
}

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
  if (!form.title.trim()) {
    toast('请填写需求标题', 'error');
    return;
  }
  if (!form.description.trim()) {
    toast('请填写需求描述', 'error');
    return;
  }
  if (!form.acceptance.trim()) {
    toast('请填写验收标准', 'error');
    return;
  }
  const budgetYuan = Number(form.budgetYuan);
  if (!isValidAmount(budgetYuan, 100)) {
    toast('预算需为不小于 100 元的有效金额', 'error');
    return;
  }
  // 提交拦截：描述偏薄且未细化时，先给一次「去细化」的机会，不强制
  if (
    !isRefined.value &&
    !isRefineHintOn.value &&
    form.description.trim().length < THIN_DESCRIPTION_LENGTH
  ) {
    isRefineHintOn.value = true;
    return;
  }
  const result = await runAction(() =>
    publishDemand({ title: form.title, budgetCents: Math.round(budgetYuan * 100) }),
  );
  if (!result) {
    toast(error.value ?? '发布失败，请检查表单', 'error');
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
          <article
            class="card page__demand"
            @click="router.push(`/demand/bids/${DEFAULT_BID_MANAGE_DEMAND_ID}`)"
          >
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
            <label>
              需求描述 <em>完整度影响匹配质量评分</em>
              <span v-if="isRefined" class="tag tag--success field__score">
                质量分 {{ qualityScore }}
              </span>
            </label>
            <div class="field__textarea">
              <textarea v-model="form.description" rows="6" placeholder="建议按「背景 / 目标 / 使用场景 / 优先级」分段写清" />
              <button
                v-if="canRefine"
                class="refine-btn"
                :class="{ 'refine-btn--loading': isRefining }"
                title="AI 会补全你写的内容并直接填回输入框"
                @click="handleQuickRefine"
              >
                <span v-if="isRefining" class="spin" />
                {{ isRefining ? '完善中…' : '✦ 细化需求' }}
              </button>
            </div>
            <div v-if="refineResult" class="refine-bar">
              <header class="refine-bar__head">
                <b>✓ AI 已完善并填入输入框</b>
                <span class="tag tag--success">质量分 {{ qualityScore }}</span>
              </header>
              <ul class="refine-bar__list">
                <li v-for="item in refineResult.changes" :key="item">{{ item }}</li>
              </ul>
              <div class="refine-bar__ops">
                <button class="btn btn--ghost btn--sm" @click="isDiffOpen = true">查看改动</button>
                <button class="btn btn--ghost btn--sm" @click="isRefineOpen = true">继续追问细化</button>
                <button class="refine-bar__undo" @click="handleUndoRefine">撤销</button>
              </div>
            </div>

            <p v-if="!canRefine" class="muted field__hint">
              再写 {{ AI_REFINE_MIN_TEXT_LENGTH - form.description.trim().length }} 字，即可让 AI 帮你补全场景与验收标准
            </p>
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
          <div class="field">
            <label>交付物清单 <em>可枚举，避免交付时扯皮</em></label>
            <div class="chip-row">
              <span v-for="item in form.deliverables" :key="item" class="tag tag--plain">{{ item }}</span>
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

          <div v-if="isRefineHintOn" class="refine-hint">
            <b>描述偏简略，可能被压价或后期扯皮</b>
            <p>
              缺少使用场景与验收标准的需求，平均少收 2 份投标；让 AI 先帮你补全再提交。
            </p>
            <div class="refine-hint__ops">
              <button class="btn btn--primary btn--sm" :disabled="!canRefine" @click="handleQuickRefine">
                一键补全
              </button>
              <button class="btn btn--ghost btn--sm" @click="isRefineOpen = true">逐步细化</button>
              <button class="refine-hint__skip" @click="isRefineHintOn = false">仍要提交</button>
            </div>
          </div>

          <p v-if="isLowQuality" class="muted">
            当前质量分仍低于 {{ QUALITY_SUBMIT_THRESHOLD }}，建议再补充验收标准。
          </p>
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

    <AiRefinePanel v-model:open="isRefineOpen" :draft="refineDraft" @apply="handleApplyRefine" />

    <BaseModal
      :open="isDiffOpen"
      title="改动对照"
      subtitle="左侧为你原来的描述，右侧为 AI 补全后的内容"
      wide
      @close="isDiffOpen = false"
    >
      <div class="diff">
        <section class="diff__col">
          <header><span class="tag tag--plain">细化前</span></header>
          <pre class="diff__text diff__text--before">{{ originalSnapshot?.description ?? '（无快照）' }}</pre>
        </section>
        <section class="diff__col">
          <header><span class="tag tag--success">已填入输入框</span></header>
          <pre class="diff__text diff__text--after">{{ form.description }}</pre>
        </section>
      </div>
      <template #footer>
        <button class="btn btn--ghost" @click="handleUndoRefine">撤销并恢复原文</button>
        <button class="btn btn--primary" @click="isDiffOpen = false">保留这版</button>
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

/* 描述框内的 AI 细化入口 */
.field__textarea {
  position: relative;
}

.field__textarea textarea {
  padding-bottom: 2.75rem;
}

.refine-bar {
  margin-top: $space-3;
  padding: $space-4;
  border-radius: $radius-md;
  border: 0.0625rem solid rgba(46, 125, 91, 0.28);
  background: rgba(46, 125, 91, 0.06);
}

.refine-bar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;

  b {
    font-size: $fs-base;
    color: $color-success;
  }
}

.refine-bar__list {
  margin: $space-3 0;
  padding-left: 1.125rem;
  list-style: disc;
  font-size: $fs-sm;
  line-height: 1.8;
  color: $color-ink-2;
}

.refine-bar__ops {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.refine-bar__undo {
  font-size: $fs-sm;
  color: $color-ink-3;
  text-decoration: underline;

  &:hover {
    color: $color-danger;
  }
}

.diff {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;
}

.diff__col {
  header {
    margin-bottom: $space-3;
  }
}

.diff__text {
  margin: 0;
  padding: $space-4;
  border-radius: $radius-md;
  font-family: inherit;
  font-size: $fs-sm;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 22rem;
  overflow-y: auto;

  &--before {
    background: $color-panel;
    color: $color-ink-3;
  }

  &--after {
    background: rgba(46, 125, 91, 0.08);
    color: $color-ink-1;
  }
}

.refine-btn {
  position: absolute;
  right: 0.625rem;
  bottom: 0.625rem;
  padding: 0.375rem 0.875rem;
  border-radius: $radius-pill;
  background: $color-accent-soft;
  color: $color-accent-deep;
  font-size: $fs-sm;
  font-weight: 700;
  border: 0.0625rem solid rgba(228, 87, 46, 0.22);
  transition: all $duration-fast $ease-out;

  &:hover {
    background: $color-accent;
    color: $color-on-accent;
  }

  &:active {
    transform: scale(0.96);
  }
}

.field__hint {
  margin-top: $space-2;
}

.field__score {
  float: right;
}

.refine-hint {
  padding: $space-4;
  border-radius: $radius-md;
  background: $color-warning-soft;
  color: $color-warning;
  font-size: $fs-sm;
  line-height: 1.65;

  b {
    display: block;
    margin-bottom: $space-1;
  }

  p {
    margin-bottom: $space-3;
  }
}

.refine-hint__ops {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.refine-hint__skip {
  font-size: $fs-sm;
  color: $color-ink-3;
  text-decoration: underline;

  &:hover {
    color: $color-ink-1;
  }
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
