import { accountsApiClient } from '../apiClient';
import { API_ENDPOINTS } from '../config';
import { User, LoginResponse, OTPRequest, OTPVerification, AuthTokens, UserRegistration } from '@/types/user';

export class AuthService {
  static async register(data: UserRegistration): Promise<User> {
    return accountsApiClient.post(API_ENDPOINTS.users.create, data);
  }

  static async requestOTP(data: OTPRequest): Promise<{ success: boolean; message: string }> {
    return accountsApiClient.post(API_ENDPOINTS.auth.requestOTP, data);
  }

  static async verifyOTP(data: OTPVerification): Promise<LoginResponse> {
    return accountsApiClient.post(API_ENDPOINTS.auth.verifyOTP, data);
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return accountsApiClient.post(API_ENDPOINTS.auth.refresh, { refreshToken });
  }

  static async logout(): Promise<{ success: boolean }> {
    return accountsApiClient.post(API_ENDPOINTS.auth.logout);
  }

  static async requestEmailVerification(): Promise<{ success: boolean; message: string }> {
    return accountsApiClient.post(API_ENDPOINTS.auth.requestEmailVerification);
  }

  static async verifyEmail(code: string): Promise<{ success: boolean; message: string }> {
    return accountsApiClient.post(API_ENDPOINTS.auth.verifyEmail, { code });
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    return accountsApiClient.post('/accounts/api/v1/users/auth/request-password-reset', { email });
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return accountsApiClient.post('/accounts/api/v1/users/auth/reset-password', { token, newPassword });
  }

  static async getCurrentUser(): Promise<User> {
    return accountsApiClient.get('/accounts/api/v1/users/me');
  }

  static async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return accountsApiClient.patch(API_ENDPOINTS.users.update.replace(':id', userId), data);
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return accountsApiClient.post('/accounts/api/v1/users/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  static async deleteAccount(): Promise<{ success: boolean }> {
    return accountsApiClient.delete('/accounts/api/v1/users/me');
  }
}