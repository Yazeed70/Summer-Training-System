import { enRoles } from './enums';

export interface LoginRequestDto {
  username: string;
  password?: string;
}

export interface RegisterRequestDto {
  name: string;
  username: string;
  password?: string;
  confirmPassword?: string;
}

export interface UpdateProfileDto {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpgradeRoleDto {
  requestedRoleId: enRoles;
  collegeId?: number;
  companyId?: number;
  officialEmail: string;
  proofFile: File;
}

export interface AuthResponse {
  token: string;
}

export interface UserClaims {
  id?: number;
  publicId?: string;
  username?: string;
  email?: string;
  role?: enRoles;
  collegeId?: number;
  companyId?: number;
  fullName?: string;
  exp?: number;
}
