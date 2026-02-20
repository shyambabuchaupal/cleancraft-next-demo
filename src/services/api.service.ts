/**
 * API Service
 * Handles all API requests and business logic
 */

import { apiCall } from '@/lib/axios';
import { ApiResponse, User } from '@/types';

export const apiService = {
  // User Services
  async getUser(id: string): Promise<ApiResponse<User>> {
    return apiCall(`/users/${id}`);
  },

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return apiCall('/users');
  },

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Generic Service
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return apiCall('/health');
  },
};
