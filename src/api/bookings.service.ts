import { apiClient } from './client';
import type { ApiBooking, ApiMessage } from './types';

export const bookingsService = {
  async getAll(): Promise<ApiBooking[]> {
    const { data } = await apiClient.get<ApiBooking[]>('/bookings');
    return data;
  },

  async getById(id: string): Promise<ApiBooking> {
    const { data } = await apiClient.get<ApiBooking>(`/bookings/${id}`);
    return data;
  },

  async create(payload: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }): Promise<ApiBooking> {
    const { data } = await apiClient.post<ApiBooking>('/bookings', payload);
    return data;
  },

  async updateStatus(
    id: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  ): Promise<ApiBooking> {
    const { data } = await apiClient.patch<ApiBooking>(`/bookings/${id}/status`, { status });
    return data;
  },

  async cancel(id: string): Promise<ApiMessage> {
    const { data } = await apiClient.delete<ApiMessage>(`/bookings/${id}`);
    return data;
  },
};
