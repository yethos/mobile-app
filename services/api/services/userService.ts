import { accountsApiClient } from '../apiClient';
import { API_ENDPOINTS } from '../config';
import { User } from '../../../types/user';

/**
 * User Service
 * Handles all user-related API calls
 */
export class UserService {
  /**
   * Create a new user
   */
  static async createUser(data: Omit<User, 'id' | 'profiles' | 'status' | 'emailVerified' | 'lastSeenAt'>): Promise<User> {
    const response = await accountsApiClient.post<{ user: User }>(API_ENDPOINTS.users.create, data);
    return response.user;
  }

  /**
   * Get all users (with pagination support)
   */
  static async getUsers(limit = 20, offset = 0): Promise<{ users: User[]; total: number }> {
    const response = await accountsApiClient.get<{ users: User[]; total: number }>(API_ENDPOINTS.users.list, {
      params: { limit, offset },
    });
    return response;
  }
  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    const response = await accountsApiClient.get<{ user: User }>('/accounts/api/v1/users/me');
    return response.user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await accountsApiClient.patch<{ user: User }>(API_ENDPOINTS.users.update.replace(':id', userId), data);
    return response.user;
  }

  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(userId: string, imageUri: string): Promise<{ profilePicture: string }> {
    const formData = new FormData();
    
    // React Native specific: Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    formData.append('image', blob as any, 'profile.jpg');

    const uploadResponse = await accountsApiClient.post<{ profilePicture: string }>(
      `/accounts/api/v1/users/${userId}/profile-picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return uploadResponse;
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string): Promise<{ message: string }> {
    const response = await accountsApiClient.delete<{ message: string }>(API_ENDPOINTS.users.delete.replace(':id', userId));
    return response;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User> {
    const response = await accountsApiClient.get<{ user: User }>(API_ENDPOINTS.users.getById.replace(':id', userId));
    return response.user;
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, limit = 20): Promise<User[]> {
    const response = await accountsApiClient.get<{ users: User[] }>('/accounts/api/v1/users/search', {
      params: { q: query, limit },
    });
    return response.users;
  }
}