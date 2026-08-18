import { axiosClient } from './axiosClient';
import { enEvaluationPhase } from '../types/enums';
import {
  CollegeReportTemplateDto,
  CollegeStudentReportDto,
  CompanyStudentReportDto,
  EvaluateReportDto,
  SaveTemplateDto,
  StudentReportSummaryDto,
  SubmitReportDto,
  TemplateDetailsDto,
  StudentReportDetailsDto,
} from '../types/reports';

const formatTemplatePayload = (dto: SaveTemplateDto) => {
  let reqCompany = dto.requiresCompanyEvaluation;
  let reqCollege = dto.requiresCollegeEvaluation;

  if (reqCompany === undefined && reqCollege === undefined && dto.evaluationPhase) {
    reqCompany = dto.evaluationPhase === enEvaluationPhase.CompanyEvaluation || (dto as any).evaluationPhase === 'Both';
    reqCollege = dto.evaluationPhase === enEvaluationPhase.CollegeEvaluation || (dto as any).evaluationPhase === 'Both';
  }

  return {
    templatePublicId: dto.templatePublicId,
    templateTitle: dto.templateTitle || dto.title,
    title: dto.title || dto.templateTitle,
    description: dto.description,
    isAvailable: dto.isAvailable ?? true,
    requiresCompanyEvaluation: reqCompany ?? false,
    requiresCollegeEvaluation: reqCollege ?? true,
    dueDate: dto.dueDate,
    questions: (dto.questions || []).map((q, idx) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      isRequired: q.isRequired ?? false,
      order: q.order ?? idx + 1,
      optionsPayload: q.options && q.options.length > 0 ? JSON.stringify(q.options) : q.optionsPayload,
      options: q.options,
    })),
  };
};

export const reportsService = {
  createReportTemplate: async (dto: SaveTemplateDto): Promise<{ reportPublicId: string }> => {
    const payload = formatTemplatePayload(dto);
    const res = await axiosClient.post<{ reportPublicId: string }>('/Reports/create-report', payload);
    return res.data;
  },

  getMyReports: async (): Promise<StudentReportSummaryDto[]> => {
    const res = await axiosClient.get<StudentReportSummaryDto[]>('/Reports/my-reports');
    return res.data;
  },

  submitReport: async (dto: SubmitReportDto): Promise<{ studentReportId: string }> => {
    const res = await axiosClient.post<{ studentReportId: string }>('/Reports/submit-report', dto);
    return res.data;
  },

  getCompanyReports: async (): Promise<CompanyStudentReportDto[]> => {
    const res = await axiosClient.get<CompanyStudentReportDto[]>('/Reports/company-reports');
    return res.data;
  },

  getCollegeTemplates: async (): Promise<CollegeReportTemplateDto[]> => {
    const res = await axiosClient.get<CollegeReportTemplateDto[]>('/Reports/college-templates');
    return res.data;
  },

  getCompanyTemplates: async (): Promise<CollegeReportTemplateDto[]> => {
    const res = await axiosClient.get<CollegeReportTemplateDto[]>('/Reports/company-templates');
    return res.data;
  },

  evaluateReport: async (dto: EvaluateReportDto): Promise<void> => {
    await axiosClient.post('/Reports/evaluate-report', {
      studentReportPublicId: dto.studentReportPublicId,
      score: dto.score,
      comments: dto.comments || dto.feedback,
    });
  },

  deleteTemplate: async (templatePublicId: string): Promise<void> => {
    await axiosClient.delete(`/Reports/template/${templatePublicId}`);
  },

  updateTemplate: async (templatePublicId: string, dto: SaveTemplateDto): Promise<void> => {
    const payload = formatTemplatePayload(dto);
    await axiosClient.put(`/Reports/template/${templatePublicId}`, payload);
  },

  getTemplateDetails: async (id: string): Promise<TemplateDetailsDto> => {
    const res = await axiosClient.get<TemplateDetailsDto>(`/Reports/template/${id}`);
    return res.data;
  },

  getCollegeStudentReports: async (): Promise<CollegeStudentReportDto[]> => {
    const res = await axiosClient.get<CollegeStudentReportDto[]>('/Reports/college-student-reports');
    return res.data;
  },

  uploadReportAttachment: async (file: File): Promise<{ filePath: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post<{ filePath: string }>('/Reports/upload-attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  downloadAttachmentBlob: async (filePath: string): Promise<Blob> => {
    const res = await axiosClient.get('/Reports/download-attachment', {
      params: { filePath },
      responseType: 'blob',
    });
    return res.data;
  },

  getStudentReportDetails: async (studentReportPublicId: string): Promise<StudentReportDetailsDto> => {
    const res = await axiosClient.get<StudentReportDetailsDto>(`/Reports/submission/${studentReportPublicId}`);
    return res.data;
  },

  deleteStudentReport: async (studentReportPublicId: string): Promise<void> => {
    await axiosClient.delete(`/Reports/submission/${studentReportPublicId}`);
  },
};
