import { axiosClient } from './axiosClient';
import { UpdateProfileDto, UpgradeRoleDto } from '../types/auth';
import {
  UserProfileResponseDto,
  UpgradeRequestDetailsDto,
  CollegesListDto,
  CompaniesListDto,
} from '../types/dashboard';

export const userService = {
  getUserProfile: async (): Promise<UserProfileResponseDto> => {
    const res = await axiosClient.get<UserProfileResponseDto>('/UserDashboard/profile');
    return res.data;
  },

  updateUserProfile: async (dto: UpdateProfileDto): Promise<{ message: string }> => {
    const res = await axiosClient.put<{ message: string }>('/UserDashboard/profile', dto);
    return res.data;
  },

  upgradeToStudent: async (dto: UpgradeRoleDto): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('RequestedRoleId', (dto.requestedRoleId || 1).toString());
    if (dto.collegeId) {
      formData.append('CollegeId', dto.collegeId.toString());
    }
    formData.append('OfficialEmail', dto.officialEmail);
    formData.append('ProofFile', dto.proofFile);

    const res = await axiosClient.post<{ message: string }>('/UserDashboard/upgrade-request', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  upgradeRequest: async (dto: UpgradeRoleDto): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('RequestedRoleId', dto.requestedRoleId.toString());
    formData.append('OfficialEmail', dto.officialEmail);
    formData.append('ProofFile', dto.proofFile);

    if (dto.collegeId) {
      formData.append('CollegeId', dto.collegeId.toString());
    }
    if (dto.companyId) {
      formData.append('CompanyId', dto.companyId.toString());
    }

    const res = await axiosClient.post<{ message: string }>('/UserDashboard/upgrade-request', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getUpgradeStatus: async (): Promise<UpgradeRequestDetailsDto | null> => {
    const res = await axiosClient.get<UpgradeRequestDetailsDto>('/UserDashboard/upgrade-status');
    return res.data;
  },

  getUpgradeHistory: async (): Promise<UpgradeRequestDetailsDto[]> => {
    const res = await axiosClient.get<UpgradeRequestDetailsDto[]>('/UserDashboard/upgrade-history');
    return res.data;
  },

  cancelUpgradeRequest: async (publicId: string): Promise<{ message: string }> => {
    const res = await axiosClient.patch<{ message: string }>(`/UserDashboard/cancel-request/${publicId}`);
    return res.data;
  },
  getAllCompanies: async (): Promise<CompaniesListDto[]> => {
    const res = await axiosClient.get<CompaniesListDto[]>('/UserDashboard/companies');
    return res.data;
  },
  getAllColleges: async (): Promise<CollegesListDto[]> => {
    const res = await axiosClient.get<CollegesListDto[]>('/UserDashboard/colleges');
    return res.data;
  },
  getProofFileBlob: async (publicId: string): Promise<Blob> => {
    const res = await axiosClient.get(`/UserDashboard/upgrade-requests/proof/${publicId}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
