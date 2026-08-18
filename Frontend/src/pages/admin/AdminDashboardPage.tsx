import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Building,
  ShieldAlert,
  CheckCircle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  UserPlus,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import {
  AdminDashboardStatsDto,
  PendingCompanyRequestDto,
  UpgradeRequestsListDto,
} from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompanyRequestDto[]>([]);
  const [pendingUpgrades, setPendingUpgrades] = useState<UpgradeRequestsListDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, compRequests, upgradeRequests] = await Promise.all([
        adminService.getStats().catch(() => null),
        adminService.getPendingCompanyRequests().catch(() => []),
        adminService.getPendingUpgradeRequests().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setPendingCompanies(compRequests || []);
      setPendingUpgrades(
        (upgradeRequests || []).filter(
          (u) => (u.status as any) === 1 || String(u.status).toLowerCase() === 'pending'
        )
      );
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: t('dashboard.totalStudents', 'Registered Students'),
      value: stats?.totalStudents ?? 0,
      description: t('dashboard.statStudentsDesc', 'Active university trainees'),
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60',
      link: '/admin/users',
    },
    {
      title: t('dashboard.totalColleges', 'University Colleges'),
      value: stats?.totalColleges ?? 0,
      description: t('dashboard.statCollegesDesc', 'Participating faculties'),
      icon: Building2,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60',
      link: '/admin/colleges',
    },
    {
      title: t('dashboard.totalCompanies', 'Partner Companies'),
      value: stats?.totalCompanies ?? 0,
      description: t('dashboard.statCompaniesDesc', 'Registered training entities'),
      icon: Building,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
      link: '/admin/companies',
    },
    {
      title: t('dashboard.activeTrainings', 'Active Internships'),
      value: stats?.activeTrainings ?? 0,
      description: t('dashboard.statInternshipsDesc', 'Current student placements'),
      icon: Activity,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
      link: '/admin/users',
    },
    {
      title: t('dashboard.pendingCompanies', 'Company Approvals'),
      value: stats?.pendingCompanies ?? 0,
      description: t('dashboard.statPendingCompDesc', 'Awaiting accreditation'),
      icon: ShieldAlert,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
      link: '/admin/companies',
      urgent: (stats?.pendingCompanies ?? 0) > 0,
    },
    {
      title: t('dashboard.pendingUpgrades', 'Role Upgrades'),
      value: stats?.roleUpgradeRequests ?? 0,
      description: t('dashboard.statPendingUpgDesc', 'Proof verification pending'),
      icon: CheckCircle,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
      link: '/admin/upgrades',
      urgent: (stats?.roleUpgradeRequests ?? 0) > 0,
    },
  ];

  const totalActionRequired = (stats?.pendingCompanies ?? 0) + (stats?.roleUpgradeRequests ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('admin.dashboardTitle', 'System Administration Command Center')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('admin.dashboardSubtitle', 'Global system governance, organizational entities, role approvals, and real-time training analytics')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            {t('admin.refreshData', 'Refresh Data')}
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/admin/users')}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-md"
          >
            {t('admin.manageUsers', 'Manage Users')}
          </Button>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border border-indigo-500/20 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 backdrop-blur-md text-indigo-300 shrink-0 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {t('admin.controlCenter', 'SuperAdmin Control Center')}
                </h2>
                <Badge variant="danger" size="sm" className="bg-rose-500/20 border-rose-400/30 text-rose-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {t('admin.fullAuthority', 'Full System Authority')}
                </Badge>
              </div>
              <p className="text-xs text-indigo-200/80">
                {t('admin.healthyOperational', 'System Status: Healthy & Operational')}
                <span className="mx-2">•</span>
                {totalActionRequired > 0 ? (
                  <span className="text-amber-300 font-medium">
                    {t('admin.requestsAwaitingReview', { count: totalActionRequired })}
                  </span>
                ) : (
                  <span className="text-indigo-300">{t('admin.allQueuesUpToDate', 'All approval queues are up to date')}</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/admin/colleges')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {t('admin.addCollege', 'Add College')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/admin/companies')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {t('admin.addCompany', 'Add Company')}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              onClick={() => navigate(card.link)}
              className="p-5 cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {card.value}
                    </p>
                    {card.urgent && (
                      <Badge variant="warning" size="sm">
                        {t('admin.actionRequired', 'Action Required')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{card.description}</p>
                </div>
                <div className={`p-3 rounded-2xl border ${card.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>{t('admin.manage', 'Manage')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Hub: Pending Requests Summary */}
      {(pendingCompanies.length > 0 || pendingUpgrades.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending Company Approvals */}
          {pendingCompanies.length > 0 && (
            <Card
              className="border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20"
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold">{t('admin.pendingCompaniesTitle', 'Company Registrations Awaiting Approval')}</h3>
                  </div>
                  <Badge variant="warning" size="sm">
                    {t('admin.pendingCountBadge', { count: pendingCompanies.length })}
                  </Badge>
                </div>
              }
            >
              <div className="space-y-2.5">
                {pendingCompanies.slice(0, 3).map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{comp.companyName}</p>
                      <p className="text-slate-400 truncate text-[11px]">
                        {comp.contactEmail || comp.companyAddress || '-'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin/companies')}
                      rightIcon={<ArrowUpRight className="w-3 h-3" />}
                    >
                      {t('admin.review', 'Review')}
                    </Button>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 mt-1"
                  onClick={() => navigate('/admin/companies')}
                >
                  {t('admin.viewAllCompanyRequests', { count: pendingCompanies.length })}
                </Button>
              </div>
            </Card>
          )}

          {/* Pending Role Upgrades */}
          {pendingUpgrades.length > 0 && (
            <Card
              className="border-rose-200/80 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20"
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300">
                    <CheckCircle className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-bold">{t('admin.pendingUpgradesTitle', 'Role Upgrade Requests Pending Proof Check')}</h3>
                  </div>
                  <Badge variant="danger" size="sm">
                    {t('admin.pendingCountBadge', { count: pendingUpgrades.length })}
                  </Badge>
                </div>
              }
            >
              <div className="space-y-2.5">
                {pendingUpgrades.slice(0, 3).map((upg) => (
                  <div
                    key={upg.id}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{upg.userName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-400">{t('admin.requestingRole', 'Requesting:')}</span>
                        <Badge variant="indigo" size="sm">
                          {upg.requestedRole}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin/upgrades')}
                      rightIcon={<ArrowUpRight className="w-3 h-3" />}
                    >
                      {t('admin.inspect', 'Inspect')}
                    </Button>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-rose-800 dark:text-rose-300 hover:bg-rose-100/60 mt-1"
                  onClick={() => navigate('/admin/upgrades')}
                >
                  {t('admin.viewAllUpgradeRequests', { count: pendingUpgrades.length })}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
