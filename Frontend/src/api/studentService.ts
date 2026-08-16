import { axiosClient } from './axiosClient';
import {
  StudentProfileResponseDto,
  UpdateStudentProfileDto,
  StudentTrainingHistoryDto,
  CollegeAdvisorDto,
  CollegeDocumentDto,
} from '../types/dashboard';

export const studentService = {
  getMyProfile: async (): Promise<StudentProfileResponseDto> => {
    const res = await axiosClient.get<StudentProfileResponseDto>('/StudentDashboard/stu-profile');
    return res.data;
  },

  updateStudentProfile: async (dto: UpdateStudentProfileDto): Promise<void> => {
    await axiosClient.put('/StudentDashboard/profile', dto);
  },

  getTrainingHistory: async (): Promise<StudentTrainingHistoryDto[]> => {
    const res = await axiosClient.get<StudentTrainingHistoryDto[]>('/StudentDashboard/training-history');
    return res.data;
  },

  getReportsSummary: async (): Promise<any[]> => {
    const res = await axiosClient.get<any[]>('/StudentDashboard/reports-summary');
    return res.data;
  },

  getCollegeAdvisor: async (): Promise<CollegeAdvisorDto[]> => {
    const res = await axiosClient.get<CollegeAdvisorDto[]>('/StudentDashboard/college-advisor');
    return res.data;
  },

  getCollegeDocuments: async (): Promise<CollegeDocumentDto[]> => {
    const res = await axiosClient.get<CollegeDocumentDto[]>('/StudentDashboard/college-documents');
    return res.data;
  },

  getProofFileBlob: async (publicId: string): Promise<Blob> => {
    const res = await axiosClient.get(`/StudentDashboard/proof/${publicId}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  downloadCollegeDocumentBlob: async (documentId: number): Promise<Blob> => {
    const res = await axiosClient.get(`/StudentDashboard/college-document/${documentId}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
