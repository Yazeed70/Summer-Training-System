import { enRequestStatus, enTrainingStatus, enSemesterType } from './enums';

export interface SubmitTrainingRequestDto {
  collegeId?: number;
  companyId?: number;
  companyName?: string;
  suggestedCompanyName?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  semester?: enSemesterType | number;
  acceptanceLetter?: File;
  acceptanceLetterFile?: File;
  comment?: string;
}

export interface ProcessTrainingRequestDto {
  requestPublicId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

export interface UpdateTrainingStatusDto {
  trainingRecordId: number;
  newStatus: enTrainingStatus;
  notes?: string;
}

export interface MyTrainingRequestDto {
  id?: string;
  requestPublicId?: string;
  studentName?: string;
  collegeName?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  semester?: enSemesterType | number;
  status: enRequestStatus;
  acceptanceLetterPath?: string;
  createdAt?: string;
  submittedAt?: string;
  comment?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedByUserName?: string;
  durationInWeeks?: number;
  currentWeek?: number | null;
}

export interface PendingTrainingRequestDto {
  id: string;
  requestPublicId?: string;
  studentName: string;
  studentId?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  acceptanceLetterPath?: string;
  status: enRequestStatus;
  submittedAt?: string;
  createdAt?: string;
}

export interface ActiveTrainingDto {
  id?: number;
  trainingRecordId?: number;
  studentName?: string;
  studentId?: string;
  companyName?: string;
  collegeName?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  semester?: enSemesterType | number;
  status?: enTrainingStatus;
  trainingStatus?: enTrainingStatus;
  durationInWeeks?: number;
  currentWeek?: number | null;
}

