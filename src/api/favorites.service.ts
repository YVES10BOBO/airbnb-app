import { apiClient } from './client';
import type { ApiListing } from './types';

export interface ApiFavorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
  listing: ApiListing;
}

export const favoritesService = {
  async getAll(userId: string): Promise<ApiFavorite[]> {
    const { data } = await apiClient.get<ApiFavorite[]>(`/users/${userId}/favorites`);
    return data;
  },

  async add(userId: string, listingId: string): Promise<ApiFavorite> {
    const { data } = await apiClient.post<ApiFavorite>(`/users/${userId}/favorites/${listingId}`);
    return data;
  },

  async remove(userId: string, listingId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/favorites/${listingId}`);
  },
};
