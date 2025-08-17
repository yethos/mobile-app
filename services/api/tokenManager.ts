import * as SecureStore from 'expo-secure-store';
import { AuthTokens } from '@/types/user';

const AUTH_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_DATA_KEY = 'auth_user_data';

export class TokenManager {
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  static async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(AUTH_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  static async setTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(AUTH_TOKEN_KEY, tokens.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_DATA_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      // Don't throw error on cleanup
    }
  }

  static async getUserData(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async setUserData(user: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user data:', error);
      throw error;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if we can't parse
    }
  }

  static getTokenExpirationTime(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error getting token expiration time:', error);
      return null;
    }
  }
}