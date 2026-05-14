import { apiClient, TOKEN_KEY } from './client';
import type { ApiAuthResponse, ApiUser, ApiMessage } from './types';

export const authService = {
  async login(email: string, password: string): Promise<ApiAuthResponse> {
    const { data } = await apiClient.post<ApiAuthResponse>('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  async register(
    name: string,
    email: string,
    password: string,
    phone?: string,
    username?: string,
    role?: 'HOST' | 'GUEST',
  ): Promise<ApiAuthResponse> {
    const { data } = await apiClient.post<ApiAuthResponse>('/auth/register', {
      name,
      email,
      password,
      phone,
      username: username ?? email.split('@')[0],
      role,
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  async me(): Promise<ApiUser> {
    const { data } = await apiClient.get<ApiUser>('/auth/me');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiMessage> {
    const { data } = await apiClient.post<ApiMessage>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async forgotPassword(email: string): Promise<ApiMessage> {
    const { data } = await apiClient.post<ApiMessage>('/auth/forgot-password', { email }, { timeout: 45_000 });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<ApiMessage> {
    const { data } = await apiClient.post<ApiMessage>(`/auth/reset-password/${token}`, { password });
    return data;
  },
};
