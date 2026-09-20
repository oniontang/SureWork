<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <section class="not-found">
    <p class="not-found__code">404</p>
    <h1 class="page-title">页面走丢了</h1>
    <p class="muted">该页面不存在或已被移除，可能是链接过期。</p>
    <button class="btn btn--primary" @click="router.push('/')">回到工作台</button>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
  padding: 6.25rem $space-6;
  text-align: center;
}

.not-found__code {
  font-size: 4.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: $color-accent;
  line-height: 1;
}
</style>
