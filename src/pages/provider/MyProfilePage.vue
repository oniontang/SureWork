<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { fetchCertifications, fetchPortfolios, fetchProviderProfile } from '@/api/user';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatPercent } from '@/utils/format';
import type { ICertificationItemType } from '@/types/payment';
import type { IPortfolioItemType, IProviderProfileType } from '@/types/user';

const { isLoading, run } = useAsync();
const toast = useToast();

const profile = ref<IProviderProfileType | null>(null);
const portfolios = ref<IPortfolioItemType[]>([]);
const certifications = ref<ICertificationItemType[]>([]);

onMounted(async () => {
  const [me, works, certs] = await Promise.all([
    run(() => fetchProviderProfile()),
    run(() => fetchPortfolios()),
    run(() => fetchCertifications()),
  ]);
  profile.value = me;
  portfolios.value = works ?? [];
  certifications.value = certs ?? [];
});
</script>

<template>
  <div class="profile">
    <SkeletonBlock v-if="isLoading" preset="profile" />

    <template v-else-if="profile">
      <section class="card profile__head">
        <div class="profile__row">
          <UserAvatar :letter="profile.avatarLetter" tone="av-1" :size="4.5" />
          <div class="profile__info">
            <p class="profile__name">
              <b>{{ profile.name }}</b>
              <StatusTag label="认证OPC · L2" tone="accent" />
            </p>
            <p class="muted">{{ profile.title }} · {{ profile.city }} · 主页被浏览 1,246 次 / 月</p>
            <div class="chip-row profile__tags">
              <span v-for="tag in profile.skillTags" :key="tag" class="tag tag--plain">{{ tag }}</span>
              <span class="tag tag--success">可接单 · 本月档期 2 席</span>
            </div>
          </div>

          <div class="credit-ring" role="img" aria-label="信用分 912">
            <svg viewBox="0 0 110 110" width="110" height="110">
              <circle cx="55" cy="55" r="48" fill="none" stroke="#faf6f0" stroke-width="9" />
              <circle
                cx="55"
                cy="55"
                r="48"
                fill="none"
                stroke="#e4572e"
                stroke-width="9"
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 48"
                :stroke-dashoffset="2 * Math.PI * 48 * (1 - profile.creditScore / 1000)"
                transform="rotate(-90 55 55)"
              />
            </svg>
            <span><b>{{ profile.creditScore }}</b><em>信用分</em></span>
          </div>
        </div>

        <div class="stat-line profile__stats">
          <div><b>{{ profile.completedCount }}</b><span>累计完单</span></div>
          <div><b>{{ formatPercent(profile.goodRate) }}</b><span>好评率</span></div>
          <div><b>{{ formatPercent(profile.repurchaseRate) }}</b><span>复购率</span></div>
          <div><b>{{ profile.avgResponseHours }}h</b><span>平均响应</span></div>
          <div><b>{{ formatPercent(profile.lostArbitrationRate) }}</b><span>仲裁败诉率</span></div>
        </div>
      </section>

      <section>
        <div class="section-head">
          <b>作品集 · {{ portfolios.length }} 件</b>
          <span class="muted">管理作品 ›</span>
        </div>
        <div class="profile__works">
          <article v-for="work in portfolios" :key="work.id" class="work-card reveal" @click="toast(`演示原型：查看《${work.name}》详情`)">
            <span class="work-art" :class="work.tone" />
            <div class="work-card__cap">
              <b>{{ work.name }}</b>
              <span>{{ work.category }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="profile__bottom">
        <article class="card">
          <b class="card-title">认证进度</b>
          <div v-for="item in certifications" :key="item.id" class="setting-row">
            <div>
              <p class="setting-row__title">{{ item.levelLabel }}</p>
              <p class="setting-row__desc">{{ item.description }}</p>
            </div>
            <div class="setting-row__end">
              <StatusTag
                :label="item.status === 'done' ? '已完成' : `进行中 ${item.progressPercent}%`"
                :tone="item.status === 'done' ? 'success' : 'accent'"
              />
            </div>
          </div>
        </article>

        <article class="card">
          <b class="card-title">最近评价</b>
          <div class="review">
            <p class="review__meta">山野咖啡 · 品牌视觉升级 <span>★★★★★</span></p>
            <p class="review__text">三个里程碑全部准时，M2 的菜单系统比预期多做了一版深夜档。</p>
          </div>
          <div class="review">
            <p class="review__meta">铁馆健身 · 海报系列 <span>★★★★★</span></p>
            <p class="review__text">改稿响应快，验收一次过，已经预约下一个项目。</p>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.profile {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.profile__row {
  display: flex;
  align-items: center;
  gap: $space-6;
}

.profile__info {
  flex: 1;
  min-width: 0;
}

.profile__name {
  display: flex;
  align-items: center;
  gap: $space-3;

  b {
    font-size: $fs-2xl;
    letter-spacing: -0.01em;
  }
}

.profile__tags {
  margin-top: $space-3;
}

.credit-ring {
  position: relative;
  flex: none;

  span {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    text-align: center;
  }

  b {
    display: block;
    font-size: 1.625rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  em {
    font-style: normal;
    font-size: $fs-xs;
    color: $color-ink-3;
  }
}

.profile__stats {
  margin-top: $space-5;
  padding-top: $space-4;
  border-top: 0.0625rem solid $color-border;
}

.profile__works {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-4;
  margin-top: $space-3;
}

.work-card {
  overflow: hidden;
  border-radius: $radius-md;
  background: $color-surface;
  border: 0.0625rem solid $color-border;
  cursor: pointer;
  transition: transform $duration-fast $ease-out, box-shadow $duration-fast;

  &:hover {
    transform: translateY(-0.1875rem);
    box-shadow: $shadow-float;
  }
}

.work-card__cap {
  padding: $space-3 $space-4;

  b {
    display: block;
    font-size: $fs-base;
  }

  span {
    font-size: $fs-xs;
    color: $color-ink-3;
  }
}

.profile__bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;
  align-items: start;
}

.card-title {
  display: block;
  margin-bottom: $space-4;
  font-size: $fs-md;
}

.review {
  padding: $space-3 0;

  & + & {
    border-top: 0.0625rem solid $color-border;
  }
}

.review__meta {
  display: flex;
  justify-content: space-between;
  font-size: $fs-sm;
  color: $color-ink-3;

  span {
    color: $color-warning;
    letter-spacing: 0.0625rem;
  }
}

.review__text {
  margin-top: $space-2;
  font-size: $fs-base;
  line-height: 1.6;
}
</style>
