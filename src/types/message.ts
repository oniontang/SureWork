/** 消息类型 */
export type MessageTypeType = 'text' | 'system' | 'demand-card' | 'deliverable-card';

/** 会话 */
export interface IConversationType {
  id: string;
  orderId: string;
  peerName: string;
  peerLetter: string;
  peerAvatarTone: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
}

/** 聊天消息 */
export interface IMessageItemType {
  id: string;
  conversationId: string;
  sender: 'me' | 'peer' | 'system';
  type: MessageTypeType;
  content: string;
  meta?: string;
  createdAt: string;
}
