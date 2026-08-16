import { axiosClient } from './axiosClient';
import {
  CompanyDetailsDto,
  CreateCompanyDto,
  CreateTrainingRecordDto,
  StudentProfileResponseDto,
  CompanyStudentsListDto,
} from '../types/dashboard';

export const companyService = {
  getCompanyProfile: async (): Promise<CompanyDetailsDto> => {
    const res = await axiosClient.get<CompanyDetailsDto>('/CompanyDashboard/profile');
    return res.data;
  },

  updateCompanyProfile: async (dto: CreateCompanyDto): Promise<void> => {
    await axiosClient.put('/CompanyDashboard/profile', dto);
  },

  deleteCompanyProfile: async (): Promise<void> => {
    await axiosClient.delete('/CompanyDashboard/profile');
  },

  getCompanyStudents: async (): Promise<CompanyStudentsListDto[]> => {
    const res = await axiosClient.get<CompanyStudentsListDto[]>('/CompanyDashboard/company-students');
    return res.data;
  },

  getStudentProfile: async (studentPublicId: string): Promise<StudentProfileResponseDto> => {
    const res = await axiosClient.get<StudentProfileResponseDto>(`/CompanyDashboard/student-profile/${studentPublicId}`);
    return res.data;
  },

  linkStudent: async (dto: CreateTrainingRecordDto): Promise<{ studentPublicId: string }> => {
    const res = await axiosClient.post<{ studentPublicId: string }>('/CompanyDashboard/students/link', dto);
    return res.data;
  },

  unlinkStudent: async (studentPublicId: string): Promise<void> => {
    await axiosClient.delete(`/CompanyDashboard/students/${studentPublicId}`);
  },
};
