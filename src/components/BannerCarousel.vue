<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import type { IBannerType } from '@/types/demand';

interface IPropsType {
  banners: IBannerType[];
}

const props = defineProps<IPropsType>();
const emit = defineEmits<{ action: [banner: IBannerType] }>();

const AUTOPLAY_INTERVAL_MS = 6000;

const activeIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function goTo(index: number): void {
  activeIndex.value = index;
}

function handleAction(banner: IBannerType): void {
  emit('action', banner);
}

onMounted(() => {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced || props.banners.length < 2) {
    return;
  }
  timer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % props.banners.length;
  }, AUTOPLAY_INTERVAL_MS);
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="banner-carousel">
    <div class="banner-carousel__stage">
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="banner-carousel__slide"
        :class="{ 'banner-carousel__slide--on': index === activeIndex }"
        :aria-hidden="index !== activeIndex"
      >
        <span class="banner-carousel__eyebrow">{{ banner.eyebrow }}</span>
        <h3 class="banner-carousel__title">{{ banner.title }}</h3>
        <p class="banner-carousel__desc">{{ banner.description }}</p>
        <div class="banner-carousel__row">
          <button
            class="btn banner-carousel__btn"
            :tabindex="index === activeIndex ? 0 : -1"
            @click="handleAction(banner)"
          >
            {{ banner.actionLabel }}
          </button>
          <span class="banner-carousel__period">{{ banner.periodLabel }}</span>
        </div>
      </div>

      <div class="banner-carousel__dots" role="tablist" aria-label="Banner 切换">
        <button
          v-for="(banner, index) in banners"
          :key="banner.id"
          :class="['banner-carousel__dot', { 'banner-carousel__dot--on': index === activeIndex }]"
          :aria-label="`第 ${index + 1} 帧`"
          role="tab"
          :aria-selected="index === activeIndex"
          @click="goTo(index)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.banner-carousel {
  height: 100%;
}

.banner-carousel__stage {
  position: relative;
  height: 100%;
  min-height: 15.75rem;
  border-radius: $radius-lg;
  overflow: hidden;
  color: $color-on-accent;
  background: linear-gradient(118deg, #b93a18 0%, $color-accent 48%, #ee8a52 100%);
  box-shadow: 0 1.125rem 2.5rem -1.125rem $color-accent-glow;

  &::before {
    content: '';
    position: absolute;
    right: -4.375rem;
    top: -4.375rem;
    width: 14.375rem;
    height: 14.375rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  &::after {
    content: '';
    position: absolute;
    right: 2.5rem;
    bottom: -5.625rem;
    width: 11.25rem;
    height: 11.25rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }
}

.banner-carousel__slide {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $space-2;
  padding: $space-8;
  opacity: 0;
  transition: opacity $duration-base $ease-out;

  &--on {
    opacity: 1;
  }
}

.banner-carousel__eyebrow {
  width: fit-content;
  padding: $space-2 $space-4;
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.18);
  font-size: $fs-sm;
  font-weight: 700;
}

.banner-carousel__title {
  font-size: 1.8125rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.22;
}

.banner-carousel__desc {
  max-width: 29.375rem;
  font-size: $fs-sm;
  opacity: 0.92;
  line-height: 1.7;
}

.banner-carousel__row {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-top: $space-2;
}

.banner-carousel__btn {
  background: #fff;
  color: $color-accent-deep;
}

.banner-carousel__period {
  font-size: $fs-sm;
  opacity: 0.85;
}

.banner-carousel__dots {
  position: absolute;
  right: $space-6;
  bottom: $space-5;
  z-index: 5;
  display: flex;
  gap: $space-2;
}

.banner-carousel__dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.45);
  transition: all $duration-base $ease-out;

  &--on {
    width: 1.25rem;
    background: #fff;
  }
}
</style>
