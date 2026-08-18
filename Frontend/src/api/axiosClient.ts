import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { showErrorModal } from '../store/useErrorModalStore';
import { formatApiError } from '../utils/errorUtils';

// Global flag to prevent 401 redirect loops / race conditions
let isRedirectingToLogin = false;

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

// Response Interceptor: Parse RFC 7807 ProblemDetails & Handle Global Errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};
    const status = error.response?.status;
    const formattedError = formatApiError(error);

    // 1. Prevent 401 Unauthorized Redirect Loops
    if (status === 401) {
      if (!config.skipAuthRedirect && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        
        toast.error('انتهت صلاحية الجلسة', {
          description: 'يرجى تسجيل الدخول مرة أخرى للمتابعة.',
        });

        useAuthStore.getState().logout();

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        // Reset flag after a delay in case of client routing
        setTimeout(() => {
          isRedirectingToLogin = false;
        }, 3000);
      }
      return Promise.reject(error);
    }

    // 2. Granular handling for 400 Bad Request & custom flags
    // If request explicitly asked to skip global modal, or if this is a standard form validation error (with errors dictionary)
    if (config.skipGlobalErrorModal || formattedError.isValidationError) {
      return Promise.reject(error);
    }

    // 3. For 403, 404, 409, 500, business domain errors (with errorCode), or network failures:
    // Trigger the gentle user-friendly error pop-up modal
    showErrorModal({
      title: formattedError.title,
      message: formattedError.message,
      errorCode: formattedError.errorCode,
      traceId: formattedError.traceId,
      status: formattedError.status,
      validationErrors: formattedError.validationErrors,
    });

    return Promise.reject(error);
  }
);
