/**
 * Standard RFC 7807 Problem Details response representation
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errorCode?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
  // Fallbacks for backward-compatibility
  code?: string;
  devMessage?: string;
  message?: string;
  [key: string]: any;
}

export type ApiErrorResponseDTO = ProblemDetails;

export interface ApiSuccessResponse<T = any> {
  data?: T;
  message?: string;
}

// Module augmentation for Axios request config to allow custom flags
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorModal?: boolean;
    skipAuthRedirect?: boolean;
  }
}
