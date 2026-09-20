<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';

interface IPropsType {
  open: boolean;
  title: string;
  subtitle?: string;
  /** 宽版双栏弹窗（发布需求） */
  wide?: boolean;
}

const props = defineProps<IPropsType>();
const emit = defineEmits<{ close: []; 'update:open': [value: boolean] }>();

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open) {
    close();
  }
}

function close(): void {
  emit('close');
  emit('update:open', false);
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeydown);
    } else {
      window.removeEventListener('keydown', handleKeydown);
    }
  },
);

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-layer">
      <div class="modal-layer__scrim" @click="close" />
      <section class="modal" :class="{ 'modal--wide': wide }" role="dialog" aria-modal="true" :aria-label="title">
        <header class="modal__head">
          <div>
            <h3>{{ title }}</h3>
            <p v-if="subtitle" class="muted">{{ subtitle }}</p>
          </div>
          <button class="modal__close" aria-label="关闭" @click="close">✕</button>
        </header>
        <div class="modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal__foot">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.modal-layer__scrim {
  position: fixed;
  inset: 0;
  z-index: $z-scrim;
  background: rgba(24, 15, 8, 0.45);
  backdrop-filter: blur(0.1875rem);
}

.modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: $z-modal;
  width: min(32.5rem, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  background: $color-surface;
  border-radius: $radius-xl;
  box-shadow: $shadow-float;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
  }

  &--wide {
    width: min(55rem, 94vw);
  }
}

.modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-4;
  padding: $space-6 $space-6 $space-2;

  h3 {
    font-size: $fs-xl;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
}

.modal__close {
  flex: none;
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: $color-panel;
  color: $color-ink-3;
  transition: all $duration-fast;

  &:hover {
    background: $color-accent-soft;
    color: $color-accent-deep;
  }
}

.modal__body {
  padding: $space-5 $space-6 $space-6;
}

.modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: $space-3;
  padding: 0 $space-6 $space-6;
}
</style>
