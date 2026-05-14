import { apiClient } from './client';
import type { ApiListing, ApiPaginatedResponse } from './types';

export interface AiChatParams {
  sessionId?: string;
  message: string;
  listingId?: string;
}

export interface AiChatResponse {
  response: string;
  sessionId: string;
}

export interface AiReviewSummaryResponse {
  summary: string;
  insights: string[];
}

export const aiService = {
  async search(
    query: string,
    params?: { page?: number; limit?: number },
  ): Promise<ApiPaginatedResponse<ApiListing>> {
    const { data } = await apiClient.post<ApiPaginatedResponse<ApiListing>>(
      '/ai/search',
      { query },
      { params },
    );
    return data;
  },

  async generateDescription(
    listingId: string,
    tone?: 'professional' | 'casual' | 'luxury',
  ): Promise<ApiListing> {
    const { data } = await apiClient.post<ApiListing>(
      `/ai/listings/${listingId}/generate-description`,
      { tone },
    );
    return data;
  },

  async chat(params: AiChatParams): Promise<AiChatResponse> {
    const { data } = await apiClient.post<AiChatResponse>('/ai/chat', params);
    return data;
  },

  async recommend(): Promise<ApiListing[]> {
    const { data } = await apiClient.post<ApiListing[]>('/ai/recommend');
    return data;
  },

  async getReviewSummary(listingId: string): Promise<AiReviewSummaryResponse> {
    const { data } = await apiClient.get<AiReviewSummaryResponse>(
      `/ai/listings/${listingId}/review-summary`,
    );
    return data;
  },
};
