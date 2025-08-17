/**
 * API Configuration for Microservices Architecture
 * 
 * This configuration supports the accounts microservice which handles all user-related operations.
 * The accounts service endpoints are prefixed with `/accounts/api/v1/`.
 * 
 * Environment Variables:
 * - EXPO_PUBLIC_API_URL: Main API base URL (default: http://localhost:3000)
 * - EXPO_PUBLIC_ACCOUNTS_API_URL: Accounts service URL (optional, defaults to main API URL)
 */
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  accountsBaseURL: process.env.EXPO_PUBLIC_ACCOUNTS_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints (accounts service)
  auth: {
    requestOTP: '/accounts/api/v1/users/auth/request-otp',
    verifyOTP: '/accounts/api/v1/users/auth/verify-otp',
    login: '/accounts/api/v1/users/auth/login',
    refresh: '/accounts/api/v1/users/auth/refresh',
    logout: '/accounts/api/v1/users/auth/logout',
    requestEmailVerification: '/accounts/api/v1/users/auth/request-email-verification',
    verifyEmail: '/accounts/api/v1/users/auth/verify-email',
  },
  
  // User endpoints (accounts service)
  users: {
    create: '/accounts/api/v1/users',
    list: '/accounts/api/v1/users',
    getById: '/accounts/api/v1/users/:id',
    getProfiles: '/accounts/api/v1/users/:id/profiles',
    update: '/accounts/api/v1/users/:id',
    updateProfile: '/accounts/api/v1/users/:id/profile',
    delete: '/accounts/api/v1/users/:id',
  },
  
  // Profile endpoints (accounts service)
  profiles: {
    create: '/accounts/api/v1/profiles',
    list: '/accounts/api/v1/profiles',
    getById: '/accounts/api/v1/profiles/:id',
    update: '/accounts/api/v1/profiles/:id',
    delete: '/accounts/api/v1/profiles/:id',
  },
  
  // Add other non-user related endpoints here as your app grows
} as const;

// Error codes that should trigger token refresh
export const AUTH_ERROR_CODES = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;