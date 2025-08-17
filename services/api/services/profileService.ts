import { accountsApiClient } from '../apiClient';
import { API_ENDPOINTS } from '../config';
import { Profile } from '../../../types/user';

/**
 * Profile Service
 * Handles all profile-related API calls
 */
export class ProfileService {
  /**
   * Create a new profile
   */
  static async createProfile(data: Omit<Profile, 'id' | 'lastProfileUpdate'>): Promise<Profile> {
    const response = await accountsApiClient.post<{ profile: Profile }>(API_ENDPOINTS.profiles.create, data);
    return response.profile;
  }

  /**
   * Get all profiles for the current user
   */
  static async getProfiles(): Promise<Profile[]> {
    const response = await accountsApiClient.get<{ profiles: Profile[] }>(API_ENDPOINTS.profiles.list);
    return response.profiles;
  }

  /**
   * Get a specific profile by ID
   */
  static async getProfileById(profileId: string): Promise<Profile> {
    const response = await accountsApiClient.get<{ profile: Profile }>(
      API_ENDPOINTS.profiles.getById.replace(':id', profileId)
    );
    return response.profile;
  }

  /**
   * Update a profile
   */
  static async updateProfile(profileId: string, data: Partial<Profile>): Promise<Profile> {
    const response = await accountsApiClient.patch<{ profile: Profile }>(
      API_ENDPOINTS.profiles.update.replace(':id', profileId),
      data
    );
    return response.profile;
  }

  /**
   * Delete a profile
   */
  static async deleteProfile(profileId: string): Promise<{ message: string }> {
    const response = await accountsApiClient.delete<{ message: string }>(
      API_ENDPOINTS.profiles.delete.replace(':id', profileId)
    );
    return response;
  }

  /**
   * Get profiles for a specific user
   */
  static async getUserProfiles(userId: string): Promise<Profile[]> {
    const response = await accountsApiClient.get<{ profiles: Profile[] }>(
      API_ENDPOINTS.users.getProfiles.replace(':id', userId)
    );
    return response.profiles;
  }

  /**
   * Update user's profile (using the user endpoint)
   */
  static async updateUserProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    const response = await accountsApiClient.patch<{ profile: Profile }>(
      API_ENDPOINTS.users.updateProfile.replace(':id', userId),
      data
    );
    return response.profile;
  }
}