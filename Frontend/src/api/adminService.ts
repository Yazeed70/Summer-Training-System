import { axiosClient } from './axiosClient';
import {
  AdminDashboardStatsDto,
  AdminUserDetailsDto,
  AdminUserListItemDto,
  AdminResetPasswordDto,
  CreateCollegeRepDto,
  CreateCompanyRepDto,
  CompanyDetailsDto,
  CompaniesListDto,
  CreateCompanyDto,
  PendingCompanyRequestDto,
  CollegeDetailsDto,
  CollegesListDto,
  CreateCollegeDto,
  UpgradeRequestsListDto,
  UpgradeRequestDetailsDto,
  PendingUpgradeRequestDto,
  HandleUpgradeRequestDto,
} from '../types/dashboard';

export const adminService = {
  getStats: async (): Promise<AdminDashboardStatsDto> => {
    const res = await axiosClient.get<AdminDashboardStatsDto>('/AdminDashboard/dashboard-stats');
    return res.data;
  },

  getAllUsers: async (): Promise<AdminUserListItemDto[]> => {
    const res = await axiosClient.get<AdminUserListItemDto[]>('/AdminDashboard/users');
    return res.data;
  },

  getAllStudents: async (): Promise<AdminUserListItemDto[]> => {
    const res = await axiosClient.get<AdminUserListItemDto[]>('/AdminDashboard/users');
    return res.data;
  },

  getAllCollegeReps: async (): Promise<AdminUserListItemDto[]> => {
    const res = await axiosClient.get<AdminUserListItemDto[]>('/AdminDashboard/college-reps');
    return res.data;
  },

  getAllCompanyReps: async (): Promise<AdminUserListItemDto[]> => {
    const res = await axiosClient.get<AdminUserListItemDto[]>('/AdminDashboard/company-reps');
    return res.data;
  },

  getUserDetails: async (publicId: string): Promise<AdminUserDetailsDto> => {
    const res = await axiosClient.get<AdminUserDetailsDto>(`/AdminDashboard/users/${publicId}`);
    return res.data;
  },

  toggleUserStatus: async (userPublicId: string): Promise<{ newStatus: string }> => {
    const res = await axiosClient.patch<{ newStatus: string }>(`/AdminDashboard/users/${userPublicId}/toggle-status`);
    return res.data;
  },

  resetUserPassword: async (publicId: string, dto: AdminResetPasswordDto): Promise<void> => {
    await axiosClient.post(`/AdminDashboard/users/${publicId}/reset-password`, dto);
  },

  createCollegeRep: async (dto: CreateCollegeRepDto): Promise<void> => {
    await axiosClient.post('/AdminDashboard/users/college-reps', dto);
  },

  createCompanyRep: async (dto: CreateCompanyRepDto): Promise<void> => {
    await axiosClient.post('/AdminDashboard/users/company-reps', dto);
  },

  getAllCompanies: async (): Promise<CompaniesListDto[]> => {
    const res = await axiosClient.get<CompaniesListDto[]>('/AdminDashboard/companies');
    return res.data;
  },

  getPendingCompanyRequests: async (): Promise<PendingCompanyRequestDto[]> => {
    const res = await axiosClient.get<PendingCompanyRequestDto[]>('/AdminDashboard/companies/pending');
    return res.data;
  },

  createCompany: async (dto: CreateCompanyDto): Promise<{ companyId: number }> => {
    const res = await axiosClient.post<{ companyId: number }>('/AdminDashboard/companies', dto);
    return res.data;
  },

  getCompanyById: async (id: number): Promise<CompanyDetailsDto> => {
    const res = await axiosClient.get<CompanyDetailsDto>(`/AdminDashboard/companies/${id}`);
    return res.data;
  },

  updateCompany: async (id: number, dto: CreateCompanyDto): Promise<void> => {
    await axiosClient.put(`/AdminDashboard/companies/${id}`, dto);
  },

  approveCompany: async (id: number): Promise<void> => {
    await axiosClient.patch(`/AdminDashboard/companies/${id}/approve`);
  },

  toggleCompanyStatus: async (id: number): Promise<void> => {
    await axiosClient.patch(`/AdminDashboard/companies/${id}/toggle-status`);
  },

  deleteCompany: async (id: number): Promise<void> => {
    await axiosClient.delete(`/AdminDashboard/companies/${id}`);
  },

  getAllColleges: async (): Promise<CollegesListDto[]> => {
    const res = await axiosClient.get<CollegesListDto[]>('/AdminDashboard/colleges');
    return res.data;
  },

  createCollege: async (dto: CreateCollegeDto): Promise<{ collegeId: number }> => {
    const res = await axiosClient.post<{ collegeId: number }>('/AdminDashboard/colleges', dto);
    return res.data;
  },

  getCollegeById: async (id: number): Promise<CollegeDetailsDto> => {
    const res = await axiosClient.get<CollegeDetailsDto>(`/AdminDashboard/colleges/${id}`);
    return res.data;
  },

  updateCollege: async (id: number, dto: CreateCollegeDto): Promise<void> => {
    await axiosClient.put(`/AdminDashboard/colleges/${id}`, dto);
  },

  toggleCollegeStatus: async (id: number): Promise<void> => {
    await axiosClient.patch(`/AdminDashboard/colleges/${id}/toggle-status`);
  },

  deleteCollege: async (id: number): Promise<void> => {
    await axiosClient.delete(`/AdminDashboard/colleges/${id}`);
  },

  getPendingUpgradeRequests: async (): Promise<UpgradeRequestsListDto[]> => {
    const res = await axiosClient.get<UpgradeRequestsListDto[]>('/AdminDashboard/upgrade-requests');
    return res.data;
  },

  getUpgradeRequestById: async (publicId: string): Promise<UpgradeRequestDetailsDto> => {
    const res = await axiosClient.get<UpgradeRequestDetailsDto>(`/AdminDashboard/upgrade-request/${publicId}`);
    return res.data;
  },

  approveUpgradeRequest: async (publicId: string): Promise<void> => {
    await axiosClient.post(`/AdminDashboard/upgrade-requests/${publicId}/approve`);
  },

  rejectUpgradeRequest: async (publicId: string, dto: HandleUpgradeRequestDto): Promise<void> => {
    await axiosClient.post(`/AdminDashboard/upgrade-requests/${publicId}/reject`, dto);
  },

  getProofFileBlob: async (publicId: string): Promise<Blob> => {
    const res = await axiosClient.get(`/AdminDashboard/upgrade-requests/proof/${publicId}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
