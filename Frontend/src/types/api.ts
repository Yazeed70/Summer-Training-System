export interface ApiErrorResponseDTO {
  Code?: string;
  DevMessage?: string;
}

export interface ApiSuccessResponse<T = any> {
  data?: T;
  message?: string;
}
