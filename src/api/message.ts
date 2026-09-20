import { request } from '@/api/request';
import { CONVERSATIONS, MESSAGES } from '@/api/mocks';
import { containsContactLeak } from '@/utils/validate';
import type { IConversationType, IMessageItemType } from '@/types/message';

export function fetchConversations(): Promise<IConversationType[]> {
  return request(() => CONVERSATIONS, 280);
}

export function fetchMessages(conversationId: string): Promise<IMessageItemType[]> {
  return request(() => MESSAGES.filter((msg) => msg.conversationId === conversationId), 280);
}

/**
 * 发送消息。
 * 风控：命中联系方式外泄检测时拒绝发送并提示（防跳单 + 防私联）。
 */
export function sendMessage(conversationId: string, content: string): Promise<IMessageItemType> {
  return request(() => {
    if (!content.trim()) {
      throw new Error('消息内容不能为空');
    }
    if (containsContactLeak(content)) {
      throw new Error('检测到联系方式，站内沟通受平台保护，请勿引导线下交易');
    }
    return {
      id: `msg-${Date.now()}`,
      conversationId,
      sender: 'me' as const,
      type: 'text' as const,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
  }, 200);
}

/** 模拟对方回复（真实项目为 WebSocket / 长轮询推送） */
export function fetchPeerReply(conversationId: string): Promise<IMessageItemType> {
  return request(
    () => ({
      id: `msg-reply-${Date.now()}`,
      conversationId,
      sender: 'peer' as const,
      type: 'text' as const,
      content: '收到，我核对下排期，1 小时内给你答复。',
      createdAt: new Date().toISOString(),
    }),
    1400,
  );
}
