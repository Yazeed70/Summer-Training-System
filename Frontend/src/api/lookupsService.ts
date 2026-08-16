import { axiosClient } from './axiosClient';

export interface LookupItem {
  id: number;
  name: string;
}

export const lookupsService = {
  getCompanies: async (): Promise<LookupItem[]> => {
    const res = await axiosClient.get<any[]>('/Lookups/companies');
    return (res.data || []).map((item) => ({
      id: item.id,
      name: item.companyName || item.name || '',
    }));
  },

  getRoles: async (): Promise<LookupItem[]> => {
    const res = await axiosClient.get<any[]>('/Lookups/roles');
    return (res.data || []).map((item) => ({
      id: item.id,
      name: item.roleName || item.name || '',
    }));
  },

  getColleges: async (): Promise<LookupItem[]> => {
    const res = await axiosClient.get<any[]>('/Lookups/colleges');
    return (res.data || []).map((item) => ({
      id: item.id,
      name: item.collegeName || item.name || '',
    }));
  },
};
