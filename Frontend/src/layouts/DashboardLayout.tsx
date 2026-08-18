import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Building2,
  Building,
  UserCheck,
  FileSpreadsheet,
  FileText,
  ClipboardList,
  School,
  LogOut,
  Moon,
  Sun,
  Globe,
  Menu,
  X,
  ChevronDown,
  User,
  Bell,
  Search,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { enRoles } from '../types/enums';
import { Badge } from '../components/ui/Badge';

export const DashboardLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define Navigation Items based on Role
  const getNavItems = () => {
    if (!user?.role) return [];

    switch (user.role) {
      case enRoles.SuperAdmin:
        return [
          { to: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
          { to: '/admin/users', label: t('nav.users'), icon: Users },
          { to: '/admin/colleges', label: t('nav.colleges'), icon: Building2 },
          { to: '/admin/companies', label: t('nav.companies'), icon: Building },
          { to: '/admin/upgrades', label: t('nav.upgrades'), icon: UserCheck },
        ];
      case enRoles.CollegeRep:
        return [
          { to: '/college', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
          { to: '/college/profile', label: t('nav.collegeProfile'), icon: School },
          { to: '/college/students', label: t('nav.studentRoster'), icon: Users },
          { to: '/college/pending-requests', label: t('nav.trainingRequests'), icon: ClipboardList },
          { to: '/college/templates', label: t('nav.reportTemplates'), icon: FileSpreadsheet },
          { to: '/college/evaluations', label: t('nav.reportSubmissions'), icon: FileText },
        ];
      case enRoles.CompanyRep:
        return [
          { to: '/company', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
          { to: '/company/profile', label: t('nav.companyProfile', 'Company Profile'), icon: Building },
          { to: '/company/trainees', label: t('nav.traineeRoster'), icon: Users },
          { to: '/company/templates', label: t('nav.reportTemplates'), icon: FileSpreadsheet },
          { to: '/company/evaluations', label: t('nav.reportSubmissions'), icon: FileText },
        ];
      case enRoles.Student:
        return [
          { to: '/student', label: t('nav.myTraining'), icon: LayoutDashboard, end: true },
          { to: '/student/college', label: t('nav.myCollege'), icon: School },
          { to: '/student/reports', label: t('nav.reportsHub'), icon: FileText },
        ];
      case enRoles.BasicUser:
      default:
        return [
          { to: '/profile', label: t('common.profile'), icon: User, end: true },
          { to: '/user/upgrades', label: 'Role Upgrade Center', icon: UserCheck },
          { to: '/user/colleges', label: 'University Colleges', icon: Building2 },
          { to: '/user/companies', label: 'Training Companies', icon: Building },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = (role?: enRoles) => {
    switch (role) {
      case enRoles.SuperAdmin:
        return { text: t('roles.superAdmin'), variant: 'danger' as const };
      case enRoles.CollegeRep:
        return { text: t('roles.collegeRep'), variant: 'indigo' as const };
      case enRoles.CompanyRep:
        return { text: t('roles.companyRep'), variant: 'success' as const };
      case enRoles.Student:
        return { text: t('roles.student'), variant: 'info' as const };
      case enRoles.BasicUser:
      default:
        return { text: 'Basic User', variant: 'neutral' as const };
    }
  };

  const roleInfo = getRoleLabel(user?.role);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-indigo-500/20 shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-base hidden sm:inline-block tracking-tight text-slate-900 dark:text-white">
              {t('common.appName')}
            </span>
          </div>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 w-48 lg:w-64">
            <Search className="w-4 h-4" />
            <span>{t('common.search')}</span>
          </div>

          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1 transition-colors"
            title={t('common.language')}
          >
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>{i18n.language.toUpperCase()}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('common.theme')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left rtl:text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                  {user?.fullName || user?.username || user?.email}
                </span>
                <span className="text-[10px] text-slate-400">{roleInfo.text}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:inline-block" />
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.fullName || user?.username}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || `@${user?.username}`}</p>
                  <div className="mt-1.5">
                    <Badge variant={roleInfo.variant} size="sm">
                      {roleInfo.text}
                    </Badge>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/profile')}
                  className="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{t('common.profile')}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 start-0 z-40 w-64 bg-white dark:bg-slate-900 border-e border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between lg:hidden">
              <span className="text-sm font-bold">{t('common.appName')}</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${isActive
                        ? 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.fullName || user?.username}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || `@${user?.username}`}</p>
            </div>
          </div>
        </aside>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
