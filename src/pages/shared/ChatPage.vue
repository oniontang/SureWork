<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';

import { fetchConversations, fetchMessages, fetchPeerReply, sendMessage } from '@/api/message';
import ChatMessageItem from '@/components/ChatMessageItem.vue';
import EmptyState from '@/components/EmptyState.vue';
import SkeletonBlock from '@/components/SkeletonBlock.vue';
import StatusTag from '@/components/StatusTag.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAsync } from '@/composables/useAsync';
import { useToast } from '@/composables/useToast';
import { formatDateTime } from '@/utils/format';
import type { IConversationType, IMessageItemType } from '@/types/message';

const { isLoading, isSubmitting, error, run, runAction } = useAsync();
const toast = useToast();

const conversations = ref<IConversationType[]>([]);
const activeConversation = ref<IConversationType | null>(null);
const messages = ref<IMessageItemType[]>([]);
const draft = ref('');
const isPeerTyping = ref(false);
const messageBox = ref<HTMLElement | null>(null);
let conversationLoadToken = 0;

async function scrollToEnd(): Promise<void> {
  await nextTick();
  if (messageBox.value) {
    messageBox.value.scrollTop = messageBox.value.scrollHeight;
  }
}

async function loadConversation(conversation: IConversationType): Promise<void> {
  const token = ++conversationLoadToken;
  activeConversation.value = conversation;
  isPeerTyping.value = false;
  const list = await run(() => fetchMessages(conversation.id));
  if (token !== conversationLoadToken) {
    return;
  }
  messages.value = list ?? [];
  await scrollToEnd();
}

async function handleSend(): Promise<void> {
  if (isSubmitting.value) {
    return;
  }
  const content = draft.value.trim();
  if (!activeConversation.value || !content) {
    return;
  }
  const conversation = activeConversation.value;
  const conversationId = conversation.id;
  const sent = await runAction(() => sendMessage(conversationId, content));
  if (!sent) {
    toast(error.value ?? '消息发送失败，请稍后重试', 'error');
    return;
  }
  if (activeConversation.value?.id !== conversationId) {
    return;
  }
  messages.value = [...messages.value, sent];
  draft.value = '';
  await scrollToEnd();

  isPeerTyping.value = true;
  const reply = await run(() => fetchPeerReply(conversationId), { skeleton: false });
  isPeerTyping.value = false;
  if (reply && activeConversation.value?.id === conversationId) {
    messages.value = [...messages.value, reply];
    await scrollToEnd();
  }
}

onMounted(async () => {
  conversations.value = (await run(() => fetchConversations())) ?? [];
  const first = conversations.value[0];
  if (first) {
    await loadConversation(first);
  }
});
</script>

<template>
  <div class="chat">
    <header>
      <h1 class="page-title">消息</h1>
      <p class="page-subtitle">会话与订单绑定 · 全程留痕 · 联系方式受平台保护</p>
    </header>

    <SkeletonBlock v-if="isLoading" preset="table" />

    <div v-else-if="activeConversation" class="chat__body card">
      <aside class="chat__list">
        <button
          v-for="item in conversations"
          :key="item.id"
          :class="['conversation', { 'conversation--on': item.id === activeConversation.id }]"
          @click="loadConversation(item)"
        >
          <UserAvatar :letter="item.peerLetter" :tone="item.peerAvatarTone" :size="2.5" />
          <span class="conversation__text">
            <span class="conversation__title">
              {{ item.peerName }}
              <time>{{ formatDateTime(item.lastAt).slice(0, 5) }}</time>
            </span>
            <span class="conversation__preview">{{ item.lastMessage }}</span>
          </span>
          <span v-if="item.unreadCount" class="conversation__badge">{{ item.unreadCount }}</span>
        </button>
      </aside>

      <section class="chat__panel">
        <header class="chat__panel-head">
          <UserAvatar :letter="activeConversation.peerLetter" :tone="activeConversation.peerAvatarTone" :size="2.375" />
          <div class="chat__who">
            <b>{{ activeConversation.peerName }}</b>
            <p class="muted">认证OPC · 1.8h 内回复 · 订单 {{ activeConversation.orderId || '—' }}</p>
          </div>
          <StatusTag label="🔒 联系方式保护中" tone="teal" />
          <button class="btn btn--ghost btn--sm" @click="toast('演示原型：打开订单详情')">订单详情</button>
        </header>

        <div ref="messageBox" class="chat__messages">
          <ChatMessageItem v-for="msg in messages" :key="msg.id" :message="msg" />

          <div v-if="isPeerTyping" class="chat-msg">
            <UserAvatar :letter="activeConversation.peerLetter" :tone="activeConversation.peerAvatarTone" :size="2" />
            <div class="chat-msg__bubble typing">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <footer class="chat__bar">
          <button class="btn btn--ghost" @click="toast('演示原型：支持文件 / 需求卡 / 交付卡')">附件</button>
          <input
            v-model="draft"
            placeholder="发送消息…（回车发送）"
            maxlength="500"
            :disabled="isSubmitting"
            @keydown.enter.prevent="handleSend"
          />
          <button
            class="btn btn--primary"
            :class="{ 'btn--loading': isSubmitting }"
            :disabled="isSubmitting"
            @click="handleSend"
          >
            <span v-if="isSubmitting" class="spin" />
            {{ isSubmitting ? '发送中…' : '发送' }}
          </button>
        </footer>
      </section>
    </div>

    <EmptyState v-else text="暂无会话" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.chat {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.chat__body {
  display: grid;
  grid-template-columns: 18.75rem 1fr;
  padding: 0;
  overflow: hidden;
  height: 42rem;
}

.chat__list {
  border-right: 0.0625rem solid $color-border;
  padding: $space-2;
  overflow-y: auto;
}

.conversation {
  display: flex;
  align-items: center;
  gap: $space-3;
  width: 100%;
  padding: $space-3;
  border-radius: $radius-md;
  text-align: left;
  transition: background $duration-fast;

  &:hover {
    background: $color-panel;
  }

  &--on {
    background: $color-accent-soft;
  }
}

.conversation__text {
  flex: 1;
  min-width: 0;
}

.conversation__title {
  display: flex;
  justify-content: space-between;
  gap: $space-2;
  font-size: $fs-base;
  font-weight: 700;

  time {
    font-size: $fs-xs;
    font-weight: 500;
    color: $color-ink-3;
  }
}

.conversation__preview {
  display: block;
  margin-top: $space-1;
  font-size: $fs-sm;
  color: $color-ink-3;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.conversation__badge {
  display: grid;
  place-items: center;
  min-width: 1rem;
  height: 1rem;
  padding: 0 $space-1;
  border-radius: $radius-pill;
  background: $color-accent;
  color: #fff;
  font-size: 0.625rem;
  font-weight: 700;
}

.chat__panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat__panel-head {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-4 $space-5;
  border-bottom: 0.0625rem solid $color-border;
}

.chat__who {
  flex: 1;
  min-width: 0;

  b {
    font-size: $fs-md;
  }

  p {
    font-size: $fs-xs;
  }
}

.chat__messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5;
  overflow-y: auto;
  background: $color-panel;
}

.chat-msg {
  display: flex;
  gap: $space-3;
  align-items: flex-start;
  max-width: 68%;
}

.chat-msg__bubble {
  padding: $space-3 $space-4;
  border-radius: 0.25rem 0.875rem 0.875rem 0.875rem;
  background: $color-surface;
  border: 0.0625rem solid $color-border;
  font-size: $fs-base;

  &.typing {
    display: inline-flex;
    gap: $space-2;
    min-width: 3.75rem;
  }

  &.typing span {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: $color-ink-3;
    animation: typing-blink 1s infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes typing-blink {
  0%,
  70%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }

  35% {
    opacity: 1;
    transform: translateY(-0.1875rem);
  }
}

.chat__bar {
  display: flex;
  gap: $space-3;
  align-items: center;
  padding: $space-4 $space-5;
  border-top: 0.0625rem solid $color-border;

  input {
    flex: 1;
    height: 2.625rem;
    padding: 0 $space-4;
    border-radius: $radius-md;
    border: 0.0625rem solid $color-border;
    background: $color-page;
    outline: none;

    &:focus {
      border-color: $color-accent;
    }
  }
}
</style>
