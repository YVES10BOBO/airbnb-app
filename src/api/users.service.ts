import { apiClient } from './client';
import type { ApiUser, ApiMessage, ApiMyReview } from './types';

export const usersService = {
  async getAll(): Promise<ApiUser[]> {
    const { data } = await apiClient.get<ApiUser[]>('/users');
    return data;
  },

  async getById(id: string): Promise<ApiUser> {
    const { data } = await apiClient.get<ApiUser>(`/users/${id}`);
    return data;
  },

  async update(
    id: string,
    payload: { name?: string; phone?: string; bio?: string },
  ): Promise<ApiUser> {
    const { data } = await apiClient.put<ApiUser>(`/users/${id}`, payload);
    return data;
  },

  async uploadAvatar(id: string, file: File): Promise<ApiUser> {
    const form = new FormData();
    form.append('image', file);
    const { data } = await apiClient.post<ApiUser>(`/users/${id}/avatar`, form, {
      timeout: 60_000,
    });
    return data;
  },

  async deleteAvatar(id: string): Promise<ApiMessage> {
    const { data } = await apiClient.delete<ApiMessage>(`/users/${id}/avatar`);
    return data;
  },

  async getReviews(userId: string): Promise<ApiMyReview[]> {
    const { data } = await apiClient.get<ApiMyReview[]>(`/users/${userId}/reviews`);
    return data;
  },

  async remove(id: string): Promise<ApiMessage> {
    const { data } = await apiClient.delete<ApiMessage>(`/users/${id}`);
    return data;
  },
};
