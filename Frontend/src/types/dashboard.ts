import { enRoles, enTrainingStatus, enRequestStatus, enSemesterType } from './enums';

export interface UserProfileResponseDto {
  publicId: string;
  name: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  roleName: string;
  createdAt: string;
}

export interface UpgradeRequestDetailsDto {
  id: string;
  userName: string;
  userEmail?: string;
  requestedRole: string;
  collegeName?: string;
  companyName?: string;
  officialEmail: string;
  proofFilePath: string;
  status: enRequestStatus;
  comment?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedByName?: string;
}

export interface UpdateStudentProfileDto {
  universityIdNumber?: string;
  major?: string;
  gpa?: number;
}

export interface StudentTrainingHistoryDto {
  publicId: string;
  companyName: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semester: number;
  status: enTrainingStatus;
}

export interface CollegeAdvisorDto {
  name: string;
  email?: string;
  phoneNumber?: string;
  jobTitle?: string;
  collegeName: string;
}

export interface CollegeDocumentDto {
  id: number;
  title: string;
  filePath: string;
  collegeId: number;
  collegeName: string;
  uploadedAt: string;
}

export interface HandleUpgradeRequestDto {
  isApproved: boolean;
  comment?: string;
}

export interface AdminDashboardStatsDto {
  totalStudents: number;
  totalCompanies: number;
  totalColleges: number;
  roleUpgradeRequests: number;
  pendingCompanies: number;
  activeTrainings: number;
}

export interface AdminUserListItemDto {
  id: string;
  username: string;
  name: string;
  role: string | enRoles;
  collegeName?: string;
  companyName?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AdminUserDetailsDto {
  id: string;
  username: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  role: string | enRoles;
  isActive: boolean;
  createdAt: string;
  collegeName?: string;
  companyName?: string;
  nationalId?: string;
  studentId?: string;
}

export interface AdminResetPasswordDto {
  newPassword: string;
}

export interface CreateCollegeRepDto {
  name: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  collegeName: string;
  jobTitle?: string;
  department?: string;
}

export interface CreateCompanyRepDto {
  name: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  companyName: string;
  department?: string;
}

export interface CreateCollegeDto {
  name: string;
  contactEmail?: string;
  address?: string;
}

export interface CollegesListDto {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  totalStudents: number;
}

export interface CollegeDetailsDto {
  id: number;
  name: string;
  code?: string;
  city?: string;
  contactEmail?: string;
  address: string;
  createdAt?: string;
  isActive: boolean;
  totalStudents: number;
  documents?: CollegeDocumentDto[];
}

export interface CreateCompanyDto {
  name: string;
  contactEmail?: string;
  address: string;
}

export interface CompaniesListDto {
  id: number;
  name: string;
  address: string;
  isApproved: boolean;
  isActive: boolean;
  totalStudents: number;
}

export interface CompanyDetailsDto {
  id: number;
  name: string;
  contactEmail?: string;
  address: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt?: string;
  createdByUserName?: string;
  approvedAt?: string;
  totalStudents: number;
}

export interface PendingCompanyRequestDto {
  id: number;
  companyName: string;
  companyAddress?: string;
  createdByUsername?: string;
  contactEmail?: string;
  createdAt: string;
}

export interface CollegeStudentsUpgradeRequestsListDto {
  publicId: string;
  studentId: string;
  studentName: string;
  requestedRole: string;
  collegeName: string;
  status: enRequestStatus;
  filePath: string;
  comment?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface CompanyStudentsListDto {
  studentPublicId: string;
  studentName: string;
  collegeName?: string;
  major?: string;
  trainingStatus: enTrainingStatus;
}

export interface UpgradeRequestsListDto {
  id: string;
  userName: string;
  requestedRole: string;
  companyName?: string;
  collegeName?: string;
  proofFilePath?: string;
  filePath?: string;
  status: enRequestStatus;
  createdAt?: string;
}

export interface PendingUpgradeRequestDto {
  id: string;
  userName: string;
  userEmail?: string;
  requestedRole: string;
  collegeName?: string;
  companyName?: string;
  officialEmail?: string;
  createdAt: string;
  proofFilePath: string;
}

export interface CreateTrainingRecordDto {
  studentPublicId: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  semester?: enSemesterType | number;
  status?: enTrainingStatus | number;
  notes?: string;
}

export interface ActiveTrainingListDto {
  id: number;
  companyName: string;
  trainingStatus: enTrainingStatus;
}

export interface CollegeStudentsListDto {
  publicId: string;
  studentName: string;
  completedReports: number;
  activeTraining?: ActiveTrainingListDto | null;
}

export interface ActiveTrainingDto {
  id: number;
  companyName: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semester: enSemesterType;
  trainingStatus: enTrainingStatus;
  durationInWeeks?: number;
  currentWeek?: number | null;
}

export interface StudentProfileResponseDto {
  id: string;
  name: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  collegeName: string;
  universityIdNumber?: string;
  major?: string;
  gpa?: number;
  activeTraining?: ActiveTrainingDto | null;
}

export interface UploadDocumentDto {
  title: string;
  documentType?: string;
  file: File;
}
