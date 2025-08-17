import { useState, useCallback } from 'react';
import { ApiError, ApiErrorHandler } from '@/services/api/errorHandler';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (apiCall: () => Promise<T>) => Promise<T>;
  reset: () => void;
}

export function useApi<T = any>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, isLoading: false, error: null });
      return result;
    } catch (error) {
      const apiError = ApiErrorHandler.parseError(error);
      setState(prev => ({ ...prev, isLoading: false, error: apiError }));
      throw apiError;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

interface UseLazyApiReturn<T> extends UseApiState<T> {
  execute: (apiCall: () => Promise<T>) => Promise<T>;
  reset: () => void;
}

export function useLazyApi<T = any>(): UseLazyApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, isLoading: false, error: null });
      return result;
    } catch (error) {
      const apiError = ApiErrorHandler.parseError(error);
      setState(prev => ({ ...prev, isLoading: false, error: apiError }));
      throw apiError;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

interface UseApiWithRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export function useApiWithRetry<T = any>(
  options: UseApiWithRetryOptions = {}
): UseApiReturn<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall();
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !ApiErrorHandler.shouldRetry(error)) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    const apiError = ApiErrorHandler.parseError(lastError);
    setState(prev => ({ ...prev, isLoading: false, error: apiError }));
    throw apiError;
  }, [maxRetries, retryDelay]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}