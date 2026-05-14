import { apiClient } from './client';
import type { ApiReview, ApiPaginatedResponse, ApiMessage } from './types';

export const reviewsService = {
  async getForListing(
    listingId: string,
    params?: { page?: number; limit?: number },
  ): Promise<ApiPaginatedResponse<ApiReview>> {
    const { data } = await apiClient.get<ApiPaginatedResponse<ApiReview>>(
      `/listings/${listingId}/reviews`,
      { params },
    );
    return data;
  },

  async create(listingId: string, payload: { rating: number; comment: string }): Promise<ApiReview> {
    const { data } = await apiClient.post<ApiReview>(`/listings/${listingId}/reviews`, payload);
    return data;
  },

  async remove(listingId: string, reviewId: string): Promise<ApiMessage> {
    const { data } = await apiClient.delete<ApiMessage>(
      `/listings/${listingId}/reviews/${reviewId}`,
    );
    return data;
  },
};
