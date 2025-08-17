import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { TokenManager } from '@/services/api/tokenManager';
import { AuthService } from '@/services/api/services/authService';
import apiClient from '@/services/api/apiClient';
import { User, AuthTokens } from '@/types/user';
import { router } from 'expo-router';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const clearAuthState = useCallback(async () => {
    await TokenManager.clearTokens();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const handleAuthFailure = useCallback(async () => {
    await clearAuthState();
    router.replace('/(auth)');
  }, [clearAuthState]);

  // Setup API client auth failure handler
  useEffect(() => {
    apiClient.setAuthFailureHandler(handleAuthFailure);
  }, [handleAuthFailure]);

  // Check for existing auth state on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [tokens, userData] = await Promise.all([
        TokenManager.getTokens(),
        TokenManager.getUserData(),
      ]);

      if (tokens.accessToken && userData) {
        const user = userData as User;
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };


  const login = async (tokens: AuthTokens, user: User) => {
    try {
      await Promise.all([
        TokenManager.setTokens(tokens),
        TokenManager.setUserData(user),
      ]);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate tokens on backend
      await AuthService.logout();
    } catch (error) {
      console.error('Error calling logout API:', error);
      // Continue with local cleanup even if API call fails
    }

    // Always clear local state
    await clearAuthState();
    router.replace('/(auth)');
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));

    // Persist updated user data
    TokenManager.setUserData(user).catch(error => {
      console.error('Error updating user data:', error);
    });
  };


  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    clearAuthState,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to get tokens (for API calls)
export const getAuthTokens = async () => {
  try {
    const tokens = await TokenManager.getTokens();
    return tokens;
  } catch (error) {
    console.error('Error retrieving auth tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
};