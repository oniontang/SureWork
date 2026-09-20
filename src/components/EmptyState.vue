<script setup lang="ts">
interface IPropsType {
  text?: string;
}

withDefaults(defineProps<IPropsType>(), { text: '暂无数据' });
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__mark">∅</span>
    <p>{{ text }}</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.empty-state {
  padding: $space-8;
  text-align: center;
  color: $color-ink-3;
  font-size: $fs-base;
}

.empty-state__mark {
  display: block;
  margin-bottom: $space-2;
  font-size: $fs-display;
  opacity: 0.4;
}
</style>
