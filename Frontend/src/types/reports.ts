import { enEvaluationPhase, enEvaluationScore, enQuestionType, enReportStatus } from './enums';

export interface CreateQuestionDto {
  questionText: string;
  questionType: enQuestionType;
  isRequired: boolean;
  options?: string[];
  optionsPayload?: string;
  order?: number;
}

export interface QuestionDto extends CreateQuestionDto {
  id: number;
}

export interface SaveTemplateDto {
  templatePublicId?: string;
  templateTitle?: string;
  title: string;
  description?: string;
  evaluationPhase?: enEvaluationPhase;
  dueDate?: string;
  isAvailable?: boolean;
  requiresCompanyEvaluation?: boolean;
  requiresCollegeEvaluation?: boolean;
  questions: CreateQuestionDto[];
}

export interface TemplateDetailsDto {
  templatePublicId: string;
  title: string;
  description?: string;
  evaluationPhase?: enEvaluationPhase;
  dueDate: string;
  isAvailable: boolean;
  requiresCompanyEvaluation: boolean;
  requiresCollegeEvaluation: boolean;
  createdAt?: string;
  hasSubmissions?: boolean;
  submissionsCount?: number;
  questions: QuestionDto[];
  createdByName?: string;
}

export interface CollegeReportTemplateDto {
  templatePublicId: string;
  title: string;
  description?: string;
  isAvailable: boolean;
  requiresCompanyEvaluation: boolean;
  requiresCollegeEvaluation: boolean;
  createdAt: string;
  createdByUser?: string;
  dueDate: string;
  questionsCount: number;
  submissionsCount?: number;
}

export interface StudentAnswerDto {
  questionId: number;
  answerValue?: string;
  attachmentPath?: string;
}

export interface SubmitReportDto {
  templatePublicId: string;
  answers: StudentAnswerDto[];
}

export interface EvaluateReportDto {
  studentReportPublicId: string;
  score: enEvaluationScore;
  feedback?: string;
}

export interface StudentReportSummaryDto {
  studentReportPublicId?: string;
  templatePublicId: string;
  templateTitle: string;
  description?: string;
  dueDate?: string;
  questionsCount?: number;
  status: enReportStatus;
  submittedAt?: string;
  companyScore?: enEvaluationScore;
  companyFeedback?: string;
  collegeScore?: enEvaluationScore;
  collegeFeedback?: string;
}

export interface CollegeStudentReportDto {
  studentReportPublicId: string;
  studentName: string;
  studentId?: string;
  companyName?: string;
  templateTitle: string;
  status: enReportStatus;
  submittedAt: string;
  companyScore?: enEvaluationScore;
  companyFeedback?: string;
  collegeScore?: enEvaluationScore;
  collegeFeedback?: string;
}

export interface CompanyStudentReportDto {
  studentReportPublicId: string;
  studentName: string;
  studentId?: string;
  collegeName?: string;
  templateTitle: string;
  status: enReportStatus;
  submittedAt: string;
  companyScore?: enEvaluationScore;
  companyFeedback?: string;
}
