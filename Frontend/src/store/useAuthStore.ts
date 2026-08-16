import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { UserClaims } from '../types/auth';
import { enRoles } from '../types/enums';

interface AuthState {
  token: string | null;
  user: UserClaims | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const TOKEN_KEY = 'summer_training_token';

const parseToken = (token: string): UserClaims | null => {
  try {
    const decoded: any = jwtDecode(token);
    
    // Extract role claim
    let roleVal: enRoles | undefined = undefined;
    const rawRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'] || decoded['Role'];
    
    if (rawRole) {
      if (typeof rawRole === 'number') {
        roleVal = rawRole as enRoles;
      } else if (typeof rawRole === 'string') {
        if (!isNaN(Number(rawRole))) {
          roleVal = Number(rawRole) as enRoles;
        } else {
          switch (rawRole) {
            case 'Student': roleVal = enRoles.Student; break;
            case 'CompanyRep': roleVal = enRoles.CompanyRep; break;
            case 'CollegeRep': roleVal = enRoles.CollegeRep; break;
            case 'SuperAdmin': roleVal = enRoles.SuperAdmin; break;
            case 'BasicUser': roleVal = enRoles.BasicUser; break;
          }
        }
      }
    }

    const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['nameid'] || decoded['sub'];
    const collegeId = decoded['CollegeId'] || decoded['collegeId'];
    const companyId = decoded['CompanyId'] || decoded['companyId'];
    const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded['email'];
    const username = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded['unique_name'] || decoded['name'] || decoded['sub'];
    const fullName = decoded['FullName'] || decoded['fullName'] || decoded['name'] || username || email;
    const publicId = decoded['PublicId'] || decoded['publicId'];

    return {
      id: userId ? Number(userId) : undefined,
      publicId: publicId,
      username: username,
      email: email,
      role: roleVal || enRoles.BasicUser,
      collegeId: collegeId ? Number(collegeId) : undefined,
      companyId: companyId ? Number(companyId) : undefined,
      fullName: fullName,
      exp: decoded.exp
    };
  } catch (err) {
    console.error('Failed to decode JWT token:', err);
    return null;
  }
};

const initialToken = localStorage.getItem(TOKEN_KEY);
const initialUser = initialToken ? parseToken(initialToken) : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: !!initialToken && !!initialUser,

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    const userClaims = parseToken(token);
    set({
      token,
      user: userClaims,
      isAuthenticated: !!userClaims
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({
      token: null,
      user: null,
      isAuthenticated: false
    });
  }
}));
