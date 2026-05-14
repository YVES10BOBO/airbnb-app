import { apiClient } from './client';
import type { ApiConversation, ApiChatMessage } from './types';

export const messagesService = {
  async getConversations(): Promise<ApiConversation[]> {
    const { data } = await apiClient.get<ApiConversation[]>('/messages/conversations');
    return data;
  },

  async getOrCreateConversation(participantId: string): Promise<{ id: string; other: ApiConversation['other']; updatedAt: string }> {
    const { data } = await apiClient.post('/messages/conversations', { participantId });
    return data;
  },

  async getMessages(conversationId: string): Promise<ApiChatMessage[]> {
    const { data } = await apiClient.get<ApiChatMessage[]>(`/messages/conversations/${conversationId}/messages`);
    return data;
  },

  async sendMessage(conversationId: string, body: string): Promise<ApiChatMessage> {
    const { data } = await apiClient.post<ApiChatMessage>(`/messages/conversations/${conversationId}/messages`, { body });
    return data;
  },
};
