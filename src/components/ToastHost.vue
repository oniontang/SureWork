<script setup lang="ts">
import { useUiStore } from '@/store/ui';

const ui = useUiStore();
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-host">
      <p v-for="toast in ui.toasts" :key="toast.id" class="toast" :class="`toast--${toast.tone}`">
        {{ toast.message }}
      </p>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.toast-host {
  position: fixed;
  top: 5.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: $z-toast;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  pointer-events: none;
}

.toast {
  max-width: 45rem;
  padding: $space-3 $space-6;
  border-radius: $radius-lg;
  background: rgba(34, 24, 18, 0.92);
  color: #fff;
  font-size: $fs-base;
  font-weight: 600;
  backdrop-filter: blur(0.5rem);

  &--success {
    background: rgba(46, 125, 91, 0.95);
  }

  &--error {
    background: rgba(156, 59, 46, 0.95);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all $duration-base $ease-out;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.625rem);
}
</style>
