<script setup lang="ts">
import { RouterView } from 'vue-router';

import ToastHost from '@/components/ToastHost.vue';
import { provideToast } from '@/composables/useToast';

provideToast();
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <ToastHost />
</template>
