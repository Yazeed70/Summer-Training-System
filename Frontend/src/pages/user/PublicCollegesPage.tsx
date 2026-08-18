import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Search, MapPin, Users } from 'lucide-react';
import { userService } from '../../api/userService';
import { CollegesListDto } from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';

export const PublicCollegesPage: React.FC = () => {
  const { t } = useTranslation();
  const [colleges, setColleges] = useState<CollegesListDto[]>([]);
  const [filtered, setFiltered] = useState<CollegesListDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getAllColleges()
      .then((res) => {
        setColleges(res);
        setFiltered(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(colleges);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(colleges.filter((c) => c.name.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q)));
    }
  }, [searchQuery, colleges]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('nav.publicColleges', 'University Colleges Directory')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('admin.collegesSubtitle', 'Explore academic colleges participating in the Summer Training Program')}
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder={t('admin.searchCollegesPlaceholder', 'Search college by name or location...')}
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
        <Card className="p-8 text-center text-slate-400 text-xs">
          {t('common.noData', 'No colleges found matching search criteria.')}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((college) => (
            <Card key={college.id} className="hover:shadow-md transition-shadow space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{college.name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{college.address || t('admin.noAddressSpecified', 'Main Campus')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{t('admin.studentsCount', { count: college.totalStudents ?? 0 })}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
