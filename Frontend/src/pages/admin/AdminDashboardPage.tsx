import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Building, ShieldAlert, CheckCircle, Activity, ArrowUpRight } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { AdminDashboardStatsDto } from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: t('dashboard.totalStudents'),
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60',
      link: '/admin/users',
    },
    {
      title: t('dashboard.totalColleges'),
      value: stats?.totalColleges ?? 0,
      icon: Building2,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60',
      link: '/admin/colleges',
    },
    {
      title: t('dashboard.totalCompanies'),
      value: stats?.totalCompanies ?? 0,
      icon: Building,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
      link: '/admin/companies',
    },
    {
      title: t('dashboard.pendingCompanies'),
      value: stats?.pendingCompanies ?? 0,
      icon: ShieldAlert,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
      link: '/admin/companies',
    },
    {
      title: t('dashboard.pendingUpgrades'),
      value: stats?.roleUpgradeRequests ?? 0,
      icon: CheckCircle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
      link: '/admin/upgrades',
    },
    {
      title: t('dashboard.activeTrainings'),
      value: stats?.activeTrainings ?? 0,
      icon: Activity,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
      link: '/admin/users',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            System overview and statistics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-1/3" />
              </Card>
            ))
          : statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-2xl border ${card.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(card.link)}
                      rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                    >
                      {t('common.view')}
                    </Button>
                  </div>
                </Card>
              );
            })}
      </div>
    </div>
  );
};
