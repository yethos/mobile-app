export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ApiErrorHandler {
  static parseError(error: any): ApiError {
    // Axios error
    if (error.response) {
      const { status, data } = error.response;
      return {
        message: data?.message || data?.error || 'An error occurred',
        statusCode: status,
        code: data?.code,
        details: data?.details,
      };
    }

    // Network error
    if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
        code: 'NETWORK_ERROR',
      };
    }

    // Other errors
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  static isNetworkError(error: any): boolean {
    return error.request && !error.response;
  }

  static isAuthError(error: any): boolean {
    return error.response?.status === 401;
  }

  static isForbiddenError(error: any): boolean {
    return error.response?.status === 403;
  }

  static isServerError(error: any): boolean {
    const status = error.response?.status;
    return status >= 500 && status < 600;
  }

  static shouldRetry(error: any): boolean {
    // Retry on network errors or server errors (5xx)
    return this.isNetworkError(error) || this.isServerError(error);
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s
    return Math.min(1000 * Math.pow(2, attempt), 8000);
  }
}

/**
 * Get a user-friendly error message from an API error
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const apiError = error instanceof Error ? ApiErrorHandler.parseError(error) : error as ApiError;
  
  // Map common error codes to user-friendly messages
  switch (apiError.code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid phone number or verification code';
    case 'USER_NOT_FOUND':
      return 'User not found';
    case 'EXPIRED_CODE':
      return 'Verification code has expired. Please request a new one.';
    case 'INVALID_CODE':
      return 'Invalid verification code';
    case 'RATE_LIMITED':
      return 'Too many requests. Please try again later.';
    case 'NETWORK_ERROR':
      return 'Please check your internet connection and try again';
    case 'TOKEN_EXPIRED':
    case 'UNAUTHORIZED':
      return 'Session expired. Please log in again.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action';
    case 'SERVER_ERROR':
      return 'Server error. Please try again later.';
    default:
      return apiError.message || 'An unexpected error occurred';
  }
}