import { apiClient } from './client';
import type { ApiListing, ApiPaginatedResponse, ApiMessage } from './types';

export interface ListingsParams {
  page?: number;
  limit?: number;
  location?: string;
  type?: string;
  maxPrice?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams {
  q?: string;
  location?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  page?: number;
  limit?: number;
}

export const listingsService = {
  async getAll(params?: ListingsParams): Promise<ApiPaginatedResponse<ApiListing>> {
    const { data } = await apiClient.get<ApiPaginatedResponse<ApiListing>>('/listings', { params });
    return data;
  },

  async search(params: SearchParams): Promise<ApiPaginatedResponse<ApiListing>> {
    const { data } = await apiClient.get<ApiPaginatedResponse<ApiListing>>('/listings/search', { params });
    return data;
  },

  async getById(id: string): Promise<ApiListing> {
    const { data } = await apiClient.get<ApiListing>(`/listings/${id}`);
    return data;
  },

  async create(payload: Partial<ApiListing>): Promise<ApiListing> {
    const { data } = await apiClient.post<ApiListing>('/listings', payload);
    return data;
  },

  async update(id: string, payload: Partial<ApiListing>): Promise<ApiListing> {
    const { data } = await apiClient.put<ApiListing>(`/listings/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<ApiMessage> {
    const { data } = await apiClient.delete<ApiMessage>(`/listings/${id}`);
    return data;
  },

  async uploadPhotos(id: string, files: File[]): Promise<ApiListing> {
    const form = new FormData();
    files.forEach((f) => form.append('photos', f));
    // Do not set Content-Type manually — browser sets multipart boundary.
    // Listing photo uploads can exceed default API timeout when using Cloudinary.
    const { data } = await apiClient.post<ApiListing>(`/listings/${id}/photos`, form, {
      timeout: 120_000,
    });
    return data;
  },

  async deletePhoto(listingId: string, photoId: string): Promise<ApiMessage> {
    const { data } = await apiClient.delete<ApiMessage>(`/listings/${listingId}/photos/${photoId}`);
    return data;
  },

  async adminGetAll(params?: { status?: string; page?: number; limit?: number }): Promise<ApiPaginatedResponse<ApiListing>> {
    const { data } = await apiClient.get<ApiPaginatedResponse<ApiListing>>('/listings/admin/all', { params });
    return data;
  },

  async getForHost(userId: string): Promise<ApiListing[]> {
    const { data } = await apiClient.get<ApiListing[]>(`/users/${userId}/listings`);
    return data;
  },

  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<ApiListing> {
    const { data } = await apiClient.patch<ApiListing>(`/listings/${id}/status`, { status });
    return data;
  },
};
