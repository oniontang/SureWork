<script setup lang="ts">
import StatusTag from '@/components/StatusTag.vue';
import { formatDate } from '@/utils/format';
import type { INoticeType } from '@/types/demand';

interface IPropsType {
  notices: INoticeType[];
}

defineProps<IPropsType>();
const emit = defineEmits<{ more: [] }>();

const TONE_MAP: Record<INoticeType['type'], 'teal' | 'accent' | 'warning'> = {
  升级: 'teal',
  规则: 'accent',
  活动: 'warning',
};
</script>

<template>
  <section class="notice-board card">
    <header class="notice-board__head">
      <b>社区公告</b>
      <button class="notice-board__more" @click="emit('more')">查看更多 ›</button>
    </header>
    <ul class="notice-board__list">
      <li v-for="notice in notices" :key="notice.id" class="notice-board__item">
        <StatusTag :label="notice.type" :tone="TONE_MAP[notice.type]" />
        <span class="notice-board__text">{{ notice.title }}</span>
        <time :datetime="notice.publishedAt">{{ formatDate(notice.publishedAt) }}</time>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.notice-board {
  flex: 1;
  padding: $space-4 $space-5;
}

.notice-board__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $space-2;

  b {
    font-size: $fs-md;
  }
}

.notice-board__more {
  font-size: $fs-xs;
  color: $color-ink-3;

  &:hover {
    color: $color-accent-deep;
  }
}

.notice-board__list {
  list-style: none;
}

.notice-board__item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 0;

  & + & {
    border-top: 0.0625rem solid $color-border;
  }

  time {
    flex: none;
    font-size: $fs-xs;
    color: $color-ink-3;
  }
}

.notice-board__text {
  flex: 1;
  min-width: 0;
  font-size: $fs-base;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    color: $color-accent-deep;
  }
}
</style>
