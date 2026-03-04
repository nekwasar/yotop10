/**
 * Centralized API Client for YoTop10
 * Uses axios with automatic token handling and React Query integration
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yotop10.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HttpOnly cookies
});

// Request interceptor - adds auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Dynamic import to avoid issues
    const { auth } = await import('@/auth');
    const session = await auth() as any;
    
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && originalRequest) {
      const { auth } = await import('@/auth');
      const session = await auth() as any;
      
      if (session?.refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: session.refreshToken,
          });

          const { access_token } = response.data;

          // Update tokens in a real implementation, you'd update the session
          // For now, we'll redirect to login if refresh fails
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          const { signOut } = await import('next-auth/react');
          await signOut({ callbackUrl: '/login' });
        }
      }
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  // Login with HttpOnly cookies (XSS safe)
  loginWithCookies: (email: string, password: string) =>
    apiClient.post('/auth/login-cookies', { email, password }, { withCredentials: true }),
  
  // Logout and clear cookies
  logoutCookies: () => apiClient.post('/auth/logout-cookies'),
  
  register: (email: string, password: string, username: string) =>
    apiClient.post('/auth/register', { email, password, username }),
  
  verifyEmail: (email: string, code: string) =>
    apiClient.post('/auth/verify-email', { email, code }),
  
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, new_password: newPassword }),
  
  logout: () => apiClient.post('/auth/logout'),
  
  logoutAll: () => apiClient.post('/auth/logout-all'),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  
  getMe: () => apiClient.get('/auth/me'),
};

export const usersApi = {
  getProfile: (username: string) => apiClient.get(`/users/${username}`),
  updateProfile: (data: any) => apiClient.patch('/users/me', data),
  getSettings: () => apiClient.get('/users/me/settings'),
  updateSettings: (data: any) => apiClient.patch('/users/me/settings', data),
};

export const postsApi = {
  getFeed: (params?: any) => apiClient.get('/posts/feed', { params }),
  getPost: (id: string) => apiClient.get(`/posts/${id}`),
  createPost: (data: any) => apiClient.post('/posts', data),
  updatePost: (id: string, data: any) => apiClient.patch(`/posts/${id}`, data),
  deletePost: (id: string) => apiClient.delete(`/posts/${id}`),
};

export const commentsApi = {
  getComments: (postId: string) => apiClient.get(`/posts/${postId}/comments`),
  createComment: (postId: string, data: any) => 
    apiClient.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId: string, commentId: string) => 
    apiClient.delete(`/posts/${postId}/comments/${commentId}`),
};

export const reactionsApi = {
  addReaction: (postId: string, type: string) => 
    apiClient.post(`/posts/${postId}/reactions`, { type }),
  removeReaction: (postId: string) => 
    apiClient.delete(`/posts/${postId}/reactions`),
};
