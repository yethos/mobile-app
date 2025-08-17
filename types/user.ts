export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  primaryAuthMethod: 'phone' | 'email';
  status: 'active' | 'inactive' | 'pending-verification';
  emailVerified: boolean;
  lastSeenAt?: Date;
  profiles?: Profile[];
  // Temporary fields for backward compatibility
  displayName?: string;
  phone?: string;
  profilePicture?: string;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  status?: string;
  profileImageUrl?: string;
  lastProfileUpdate: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
}

export interface OTPRequest {
  phoneNumber?: string;
  email?: string;
  primaryAuthMethod: 'phone' | 'email';
}

export interface OTPVerification {
  phoneNumber?: string;
  email?: string;
  code: string;
}

export interface UserRegistration {
  phoneNumber?: string;
  email?: string;
  primaryAuthMethod: 'phone' | 'email';
}

// Scenario 1 specific types for phone-first registration
export interface PhoneOTPRequest {
  phoneNumber: string;
  countryCode: string;
  deviceLocale?: string;
}

export interface PhoneOTPVerification {
  phoneNumber: string;
  code: string;
}