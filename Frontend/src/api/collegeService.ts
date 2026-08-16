import { axiosClient } from './axiosClient';
import {
  CollegeDetailsDto,
  CreateCollegeDto,
  CollegeStudentsListDto,
  StudentProfileResponseDto,
  UploadDocumentDto,
  CollegeStudentsUpgradeRequestsListDto,
  UpgradeRequestDetailsDto,
  HandleUpgradeRequestDto,
  CollegeDocumentDto,
} from '../types/dashboard';

export const collegeService = {
  getCollegeProfile: async (): Promise<CollegeDetailsDto> => {
    const res = await axiosClient.get<CollegeDetailsDto>('/CollegeDashboard/profile');
    return res.data;
  },

  updateCollegeProfile: async (dto: CreateCollegeDto): Promise<void> => {
    await axiosClient.put('/CollegeDashboard/profile', dto);
  },

  deleteCollegeProfile: async (): Promise<void> => {
    await axiosClient.delete('/CollegeDashboard/profile');
  },

  getCollegeStudents: async (): Promise<CollegeStudentsListDto[]> => {
    const res = await axiosClient.get<CollegeStudentsListDto[]>('/CollegeDashboard/college-students');
    return res.data;
  },

  getStudentProfile: async (studentPublicId: string): Promise<StudentProfileResponseDto> => {
    const res = await axiosClient.get<StudentProfileResponseDto>(`/CollegeDashboard/student-profile/${studentPublicId}`);
    return res.data;
  },

  linkStudent: async (userPublicId: string): Promise<{ studentPublicId: string }> => {
    const res = await axiosClient.post<{ studentPublicId: string }>(`/CollegeDashboard/students/${userPublicId}/link`);
    return res.data;
  },

  unlinkStudent: async (studentPublicId: string): Promise<void> => {
    await axiosClient.delete(`/CollegeDashboard/students/${studentPublicId}`);
  },

  uploadCollegeDocument: async (dto: UploadDocumentDto): Promise<void> => {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('file', dto.file);

    await axiosClient.post('/CollegeDashboard/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteCollegeDocument: async (documentId: number): Promise<void> => {
    await axiosClient.delete(`/CollegeDashboard/${documentId}`);
  },

  getPendingStudentRequests: async (): Promise<CollegeStudentsUpgradeRequestsListDto[]> => {
    const res = await axiosClient.get<CollegeStudentsUpgradeRequestsListDto[]>('/CollegeDashboard/pending-student-requests');
    return res.data;
  },

  getHandledStudentRequests: async (): Promise<CollegeStudentsUpgradeRequestsListDto[]> => {
    const res = await axiosClient.get<CollegeStudentsUpgradeRequestsListDto[]>('/CollegeDashboard/handled-student-requests');
    return res.data;
  },

  getStudentRequestDetails: async (publicId: string): Promise<UpgradeRequestDetailsDto> => {
    const res = await axiosClient.get<UpgradeRequestDetailsDto>(`/CollegeDashboard/student-requests/${publicId}`);
    return res.data;
  },

  handleStudentRequest: async (publicId: string, dto: HandleUpgradeRequestDto): Promise<void> => {
    await axiosClient.post(`/CollegeDashboard/handle-student-request/${publicId}`, dto);
  },

  getProofFileBlob: async (publicId: string): Promise<Blob> => {
    const res = await axiosClient.get(`/CollegeDashboard/student-requests/proof/${publicId}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  getDocuments: async (): Promise<CollegeDocumentDto[]> => {
    const res = await axiosClient.get<CollegeDocumentDto[]>('/CollegeDashboard/documents');
    return res.data;
  },

  downloadCollegeDocumentBlob: async (documentId: number): Promise<Blob> => {
    const res = await axiosClient.get(`/CollegeDashboard/document/${documentId}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
