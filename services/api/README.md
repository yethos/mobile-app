# API Architecture Documentation

## Overview

This API architecture provides a robust, scalable solution for handling API communication in the React Native/Expo app with automatic token refresh, retry logic, and comprehensive error handling.

## Key Features

1. **Automatic Token Refresh**: Seamlessly refreshes expired access tokens without user intervention
2. **Request Queue Management**: Queues failed requests during token refresh
3. **Retry Logic**: Automatically retries failed requests with exponential backoff
4. **Type Safety**: Full TypeScript support for all API calls
5. **Error Handling**: Centralized error parsing and user-friendly error messages
6. **Secure Token Storage**: Uses expo-secure-store for token persistence
7. **API Interceptors**: Request/response interceptors for authentication and error handling

## Architecture Components

### 1. API Client (`apiClient.ts`)
- Singleton axios instance with interceptors
- Handles token attachment to requests
- Manages token refresh flow
- Queues requests during token refresh
- Implements retry logic for network failures

### 2. Token Manager (`tokenManager.ts`)
- Secure storage abstraction for tokens
- Methods for getting, setting, and clearing tokens
- Handles token persistence across app sessions

### 3. API Services
- **AuthService**: Authentication-related endpoints
- **UserService**: User profile and management endpoints
- Additional services can be added following the same pattern

### 4. Error Handler (`errorHandler.ts`)
- Parses backend error responses
- Provides user-friendly error messages
- Type-safe error handling

### 5. React Hooks (`useApi.ts`)
- `useApi`: For immediate API calls with loading/error states
- `useLazyApi`: For on-demand API calls (e.g., form submissions)
- `useApiWithRetry`: Automatic retry logic for failed requests

## Usage Examples

### Basic API Call
```typescript
import { UserService } from '@/services/api';

const user = await UserService.getCurrentUser();
```

### Using Hooks in Components
```typescript
const { data, isLoading, error, execute } = useApi({
  onSuccess: (user) => console.log('User loaded:', user),
  onError: (error) => Alert.alert('Error', error.message),
});

useEffect(() => {
  execute(() => UserService.getCurrentUser());
}, []);
```

### Handling Authentication
```typescript
const { login } = useAuth();

const response = await AuthService.loginWithPhone(phone, otp);
await login(
  { accessToken: response.accessToken, refreshToken: response.refreshToken },
  response.user
);
```

## Token Refresh Flow

1. Request fails with 401 error
2. Interceptor catches the error
3. Original request is queued
4. Refresh token API is called
5. New tokens are stored securely
6. Queued requests are retried with new token
7. If refresh fails, user is logged out

## Error Handling

All API errors are automatically parsed and can be handled in three ways:

1. **Try-Catch**: For direct API calls
2. **Hook Callbacks**: Using `onError` in useApi hooks
3. **Global Handler**: Via AuthContext for auth failures

## Security Considerations

1. Tokens stored in secure storage (Keychain/Keystore)
2. Access tokens expire in 1 hour (configurable)
3. Refresh tokens should have longer expiry
4. All API calls use HTTPS
5. Tokens cleared on logout (both locally and backend)

## Adding New Endpoints

1. Create a new service file in `services/api/services/`
2. Follow the pattern of existing services
3. Export from `services/api/index.ts`
4. Use consistent error handling

Example:
```typescript
export class MessageService {
  static async getMessages(chatId: string): Promise<Message[]> {
    const response = await apiClient.get<{ messages: Message[] }>(`/v1/messages/${chatId}`);
    return response.data.messages;
  }
}
```

## Configuration

Update `services/api/config.ts` to:
- Change API base URL
- Adjust timeout settings
- Modify retry attempts
- Add new endpoints

## Best Practices

1. Always use the provided services instead of direct axios calls
2. Handle errors appropriately in components
3. Use TypeScript interfaces for all API responses
4. Keep services focused and cohesive
5. Document new endpoints and their usage
6. Test error scenarios thoroughly

## Troubleshooting

### Token Refresh Loop
- Check backend refresh endpoint
- Verify refresh token is being sent correctly
- Ensure new tokens are properly stored

### Network Errors
- Verify API base URL
- Check internet connectivity
- Review CORS settings (for web)

### Type Errors
- Ensure backend and frontend types are aligned
- Update TypeScript interfaces when API changes