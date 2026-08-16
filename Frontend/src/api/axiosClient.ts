import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { ApiErrorResponseDTO } from '../types/api';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Parse ApiErrorResponseDTO & Handle Global Errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data as ApiErrorResponseDTO | undefined;

    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (errorData?.DevMessage) {
      errorMessage = errorData.DevMessage;
    } else if (typeof error.response?.data === 'string') {
      errorMessage = error.response.data;
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (status === 401) {
      toast.error('Session Expired', {
        description: 'Please log in again to continue.',
      });
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('Access Denied', {
        description: errorData?.DevMessage || 'You do not have permission to perform this action.',
      });
    } else {
      toast.error(errorData?.Code || 'Error', {
        description: errorMessage,
      });
    }

    return Promise.reject(error);
  }
);
