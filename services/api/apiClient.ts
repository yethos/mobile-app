import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenManager } from './tokenManager';
import { ApiErrorHandler } from './errorHandler';
import { AuthTokens } from '@/types/user';
import { API_CONFIG } from './config';

interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: AxiosResponse) => void;
  reject: (error: any) => void;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: QueuedRequest[] = [];
  private onAuthFailure?: () => void;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await TokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (ApiErrorHandler.isAuthError(error) && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request
            return new Promise((resolve, reject) => {
              this.refreshQueue.push({ config: originalRequest, resolve, reject });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newTokens = await this.refreshToken();
            if (newTokens) {
              // Process queued requests
              this.refreshQueue.forEach(({ config, resolve, reject }) => {
                if (config.headers) {
                  config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                }
                this.client.request(config).then(resolve).catch(reject);
              });
              this.refreshQueue = [];

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              }
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear queue and logout
            this.refreshQueue.forEach(({ reject }) => reject(refreshError));
            this.refreshQueue = [];
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<AuthTokens | null> {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_CONFIG.accountsBaseURL}/accounts/api/v1/users/auth/refresh`, {
        refreshToken,
      });

      const newTokens: AuthTokens = response.data.tokens || response.data;
      await TokenManager.setTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await TokenManager.clearTokens();
      return null;
    }
  }

  private handleAuthFailure() {
    if (this.onAuthFailure) {
      this.onAuthFailure();
    }
  }

  public setAuthFailureHandler(handler: () => void) {
    this.onAuthFailure = handler;
  }

  public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      console.log('Making API request:', {
        method: config.method,
        url: config.url,
        baseURL: this.client.defaults.baseURL,
        data: config.data
      });
      
      const response = await this.client.request<T>(config);
      
      console.log('API response:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw ApiErrorHandler.parseError(error);
    }
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  public async retryRequest<T = any>(
    requestFn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !ApiErrorHandler.shouldRetry(error)) {
          break;
        }

        const delay = ApiErrorHandler.getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

export const apiClient = new ApiClient();
export const accountsApiClient = new ApiClient(API_CONFIG.accountsBaseURL);
export default apiClient;