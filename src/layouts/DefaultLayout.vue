<script setup lang="ts">
import { RouterView } from 'vue-router';

import AppHeader from '@/components/AppHeader.vue';
import { useReveal } from '@/composables/useReveal';

useReveal();
</script>

<template>
  <div class="layout">
    <AppHeader />
    <main class="layout__main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <footer class="layout__footer">
      如约 SureWork · 资金由持牌支付机构托管，平台不经手货款 · 争议由平台依订单留痕仲裁
    </footer>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout__main {
  flex: 1;
  width: 100%;
  max-width: $layout-max-width;
  margin: 0 auto;
  padding: $space-7 $space-8 $space-8;
}

.layout__footer {
  padding: $space-5 $space-8 $space-8;
  text-align: center;
  font-size: $fs-xs;
  color: $color-ink-3;
}
</style>
