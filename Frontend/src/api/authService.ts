import { axiosClient } from './axiosClient';
import { AuthResponse, LoginRequestDto, RegisterRequestDto, UpdateProfileDto } from '../types/auth';

export const authService = {
  login: async (dto: LoginRequestDto): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/Auth/login', dto);
    return response.data;
  },

  register: async (dto: RegisterRequestDto): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/Auth/register', dto);
    return response.data;
  },

  updateProfile: async (dto: UpdateProfileDto): Promise<void> => {
    await axiosClient.put('/Auth/update-profile', dto);
  },
};
