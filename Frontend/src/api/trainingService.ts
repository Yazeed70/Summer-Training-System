import { axiosClient } from './axiosClient';
import {
  MyTrainingRequestDto,
  PendingTrainingRequestDto,
  ProcessTrainingRequestDto,
  SubmitTrainingRequestDto,
  UpdateTrainingStatusDto,
} from '../types/training';

export const trainingService = {
  submitRequest: async (dto: SubmitTrainingRequestDto): Promise<{ id: string }> => {
    const formData = new FormData();
    if (dto.collegeId) {
      formData.append('collegeId', dto.collegeId.toString());
    }
    if (dto.companyId) {
      formData.append('companyId', dto.companyId.toString());
    }
    if (dto.suggestedCompanyName || dto.companyName) {
      formData.append('suggestedCompanyName', (dto.suggestedCompanyName || dto.companyName)!);
    }
    if (dto.startDate) {
      formData.append('startDate', dto.startDate);
    }
    if (dto.endDate) {
      formData.append('endDate', dto.endDate);
    }
    if (dto.academicYear) {
      formData.append('academicYear', dto.academicYear);
    }
    if (dto.semester !== undefined) {
      formData.append('semester', dto.semester.toString());
    }
    const letter = dto.acceptanceLetter || dto.acceptanceLetterFile;
    if (letter) {
      formData.append('acceptanceLetter', letter);
    }
    if (dto.comment) {
      formData.append('comment', dto.comment);
    }

    const res = await axiosClient.post<{ id: string }>('/Training/submit-request', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getCollegePendingRequests: async (): Promise<PendingTrainingRequestDto[]> => {
    const res = await axiosClient.get<PendingTrainingRequestDto[]>('/Training/college/pending-requests');
    return res.data;
  },

  getStudentPendingRequests: async (): Promise<PendingTrainingRequestDto[]> => {
    const res = await axiosClient.get<PendingTrainingRequestDto[]>('/Training/student/pending-requests');
    return res.data;
  },

  getPendingRequest: async (requestPublicId: string): Promise<MyTrainingRequestDto> => {
    const res = await axiosClient.get<MyTrainingRequestDto>(`/Training/request/${requestPublicId}`);
    return res.data;
  },

  processRequest: async (dto: ProcessTrainingRequestDto): Promise<void> => {
    await axiosClient.post('/Training/process-request', dto);
  },

  updateTrainingStatus: async (dto: UpdateTrainingStatusDto): Promise<void> => {
    await axiosClient.put('/Training/update-status', dto);
  },
};
