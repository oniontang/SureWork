<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue';
import { formatDateTime } from '@/utils/format';
import type { IMessageItemType } from '@/types/message';

interface IPropsType {
  message: IMessageItemType;
  peerLetter?: string;
  peerTone?: string;
  meLetter?: string;
  meTone?: string;
}

withDefaults(defineProps<IPropsType>(), {
  peerLetter: '苏',
  peerTone: 'av-1',
  meLetter: '林',
  meTone: 'av-2',
});
</script>

<template>
  <p v-if="message.sender === 'system'" class="chat-msg chat-msg--system">
    {{ message.content }}
  </p>

  <div v-else class="chat-msg" :class="{ 'chat-msg--me': message.sender === 'me' }">
    <UserAvatar
      :letter="message.sender === 'me' ? meLetter : peerLetter"
      :tone="message.sender === 'me' ? meTone : peerTone"
      :size="2"
    />

    <div v-if="message.type === 'text'" class="chat-msg__bubble">{{ message.content }}</div>

    <div v-else class="chat-msg__card">
      <p class="chat-msg__card-title">
        {{ message.type === 'demand-card' ? '📋 需求卡' : '📦 交付物' }} · {{ message.content }}
      </p>
      <p class="chat-msg__card-meta">{{ message.meta }}</p>
      <time :datetime="message.createdAt">{{ formatDateTime(message.createdAt) }}</time>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.chat-msg {
  display: flex;
  gap: $space-3;
  align-items: flex-start;
  max-width: 68%;

  &--system {
    align-self: center;
    max-width: 80%;
    margin: 0 auto;
    padding: $space-3 $space-5;
    border-radius: $radius-lg;
    border: 0.0625rem dashed $color-border;
    background: $color-surface;
    text-align: center;
    font-size: $fs-sm;
    color: $color-ink-3;
    line-height: 1.6;
  }

  &--me {
    align-self: flex-end;
    flex-direction: row-reverse;
  }
}

.chat-msg__bubble {
  padding: $space-3 $space-4;
  border-radius: 0.25rem 0.875rem 0.875rem 0.875rem;
  background: $color-surface;
  border: 0.0625rem solid $color-border;
  font-size: $fs-base;
  line-height: 1.6;
}

.chat-msg--me .chat-msg__bubble {
  background: $color-accent;
  border-color: transparent;
  color: $color-on-accent;
  border-radius: 0.875rem 0.25rem 0.875rem 0.875rem;
}

.chat-msg__card {
  min-width: 15rem;
  padding: $space-3 $space-4;
  border-radius: $radius-md;
  background: $color-panel;
  border: 0.0625rem solid $color-border;
}

.chat-msg__card-title {
  font-size: $fs-base;
  font-weight: 700;
}

.chat-msg__card-meta {
  margin-top: $space-2;
  font-size: $fs-sm;
  color: $color-ink-3;
}

time {
  align-self: center;
  font-size: $fs-xs;
  color: $color-ink-3;
}
</style>
