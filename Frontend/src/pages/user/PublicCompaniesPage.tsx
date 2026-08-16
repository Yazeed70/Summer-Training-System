import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, Search, MapPin, Users } from 'lucide-react';
import { userService } from '../../api/userService';
import { CompaniesListDto } from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';

export const PublicCompaniesPage: React.FC = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<CompaniesListDto[]>([]);
  const [filtered, setFiltered] = useState<CompaniesListDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getAllCompanies()
      .then((res) => {
        setCompanies(res);
        setFiltered(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(companies);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(companies.filter((c) => c.name.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q)));
    }
  }, [searchQuery, companies]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Training Companies Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse registered training providers offering summer internship programs
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search company by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-xs">No companies found matching search criteria.</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  <Building className="w-6 h-6" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{company.name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{company.address || 'Headquarters'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>{company.totalStudents ?? 0} Active Trainees</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
