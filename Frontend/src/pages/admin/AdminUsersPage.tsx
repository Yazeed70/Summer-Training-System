import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  UserPlus,
  KeyRound,
  Power,
  Eye,
  Search,
  RefreshCw,
  School,
  Building2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { lookupsService, LookupItem } from '../../api/lookupsService';
import { AdminUserDetailsDto, AdminUserListItemDto } from '../../types/dashboard';
import { enRoles } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';

export const AdminUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUserListItemDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserListItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailsDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Password Reset state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<AdminUserListItemDto | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Status Toggle confirm modal
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [targetToggleUser, setTargetToggleUser] = useState<AdminUserListItemDto | null>(null);

  // Representative Creation modals
  const [createCollegeRepOpen, setCreateCollegeRepOpen] = useState(false);
  const [createCompanyRepOpen, setCreateCompanyRepOpen] = useState(false);

  const [colleges, setColleges] = useState<LookupItem[]>([]);
  const [companies, setCompanies] = useState<LookupItem[]>([]);

  // Form states
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      setUsers(res);
      setFilteredUsers(res);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    lookupsService.getColleges().then(setColleges).catch(console.error);
    lookupsService.getCompanies().then(setCompanies).catch(console.error);
  }, []);

  useEffect(() => {
    let result = [...users];

    if (roleFilter !== 'all') {
      const targetRoleStr = roleFilter.toLowerCase();
      result = result.filter((u) => {
        const uRoleStr = String(u.role).toLowerCase();
        if (targetRoleStr === 'basicuser' || targetRoleStr === 'basic') {
          return uRoleStr.includes('basic') || (u.role as any) === 5 || (u.role as any) === '5';
        }
        if (targetRoleStr === 'student') {
          return uRoleStr === 'student' || (u.role as any) === 1 || (u.role as any) === '1';
        }
        if (targetRoleStr === 'collegerep' || targetRoleStr === 'college') {
          return uRoleStr.includes('college') || (u.role as any) === 3 || (u.role as any) === '3';
        }
        if (targetRoleStr === 'companyrep' || targetRoleStr === 'company') {
          return uRoleStr.includes('company') || (u.role as any) === 2 || (u.role as any) === '2';
        }
        if (targetRoleStr === 'superadmin' || targetRoleStr === 'admin') {
          return uRoleStr.includes('admin') || (u.role as any) === 4 || (u.role as any) === '4';
        }
        return uRoleStr === targetRoleStr;
      });
    }

    if (statusFilter === 'active') {
      result = result.filter((u) => u.isActive);
    } else if (statusFilter === 'inactive') {
      result = result.filter((u) => !u.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.collegeName?.toLowerCase().includes(q) ||
          u.companyName?.toLowerCase().includes(q)
      );
    }

    setFilteredUsers(result);
  }, [roleFilter, statusFilter, searchQuery, users]);

  // Statistics Computations
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = totalCount - activeCount;
  const basicUsersCount = users.filter((u) => {
    const r = String(u.role).toLowerCase();
    return r.includes('basic') || (u.role as any) === 5 || (u.role as any) === '5';
  }).length;
  const studentsCount = users.filter((u) => {
    const r = String(u.role).toLowerCase();
    return r === 'student' || (u.role as any) === 1 || (u.role as any) === '1';
  }).length;
  const collegeRepsCount = users.filter((u) => {
    const r = String(u.role).toLowerCase();
    return r.includes('college') || (u.role as any) === 3 || (u.role as any) === '3';
  }).length;
  const companyRepsCount = users.filter((u) => {
    const r = String(u.role).toLowerCase();
    return r.includes('company') || (u.role as any) === 2 || (u.role as any) === '2';
  }).length;

  const handleOpenToggleConfirm = (user: AdminUserListItemDto) => {
    setTargetToggleUser(user);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetToggleUser) return;
    try {
      setSubmitting(true);
      const res = await adminService.toggleUserStatus(targetToggleUser.id);
      toast.success(`Account for ${targetToggleUser.name} is now ${res.newStatus}`);
      setToggleConfirmOpen(false);
      if (detailsModalOpen && selectedUser) {
        setSelectedUser({ ...selectedUser, isActive: !selectedUser.isActive });
      }
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (publicId: string) => {
    try {
      setLoadingDetails(true);
      setDetailsModalOpen(true);
      const details = await adminService.getUserDetails(publicId);
      setSelectedUser(details);
    } catch (err) {
      console.error('Failed to get user details:', err);
      toast.error('Failed to fetch user profile details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!resetTargetUser) return;
    try {
      setSubmitting(true);
      await adminService.resetUserPassword(resetTargetUser.id, { newPassword });
      toast.success(`Password reset successfully for ${resetTargetUser.name}`);
      setResetModalOpen(false);
      setNewPassword('');
    } catch (err) {
      console.error('Failed to reset password:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCollegeRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim() || !repEmail.trim() || !selectedCollegeId) {
      toast.error('Please fill in all required fields');
      return;
    }
    const selectedCollege = colleges.find((c) => String(c.id) === selectedCollegeId);
    try {
      setSubmitting(true);
      await adminService.createCollegeRep({
        name: repName.trim(),
        username: repEmail.trim(),
        password: repPassword || '123456',
        confirmPassword: repPassword || '123456',
        collegeName: selectedCollege ? selectedCollege.name : '',
      });
      toast.success('College Representative created successfully');
      setCreateCollegeRepOpen(false);
      setRepName('');
      setRepEmail('');
      setRepPassword('');
      setSelectedCollegeId('');
      fetchUsers();
    } catch (err) {
      console.error('Failed to create college rep:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCompanyRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim() || !repEmail.trim() || !selectedCompanyId) {
      toast.error('Please fill in all required fields');
      return;
    }
    const selectedCompany = companies.find((c) => String(c.id) === selectedCompanyId);
    try {
      setSubmitting(true);
      await adminService.createCompanyRep({
        name: repName.trim(),
        username: repEmail.trim(),
        password: repPassword || '123456',
        confirmPassword: repPassword || '123456',
        companyName: selectedCompany ? selectedCompany.name : '',
      });
      toast.success('Company Representative created successfully');
      setCreateCompanyRepOpen(false);
      setRepName('');
      setRepEmail('');
      setRepPassword('');
      setSelectedCompanyId('');
      fetchUsers();
    } catch (err) {
      console.error('Failed to create company rep:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string | number | enRoles) => {
    const roleStr = String(role).toLowerCase();
    if (roleStr.includes('admin') || role === enRoles.SuperAdmin || role === 4 || role === '4') {
      return (
        <Badge variant="danger" size="sm">
          SuperAdmin
        </Badge>
      );
    }
    if (roleStr.includes('college') || role === enRoles.CollegeRep || role === 3 || role === '3') {
      return (
        <Badge variant="indigo" size="sm">
          College Rep
        </Badge>
      );
    }
    if (roleStr.includes('company') || role === enRoles.CompanyRep || role === 2 || role === '2') {
      return (
        <Badge variant="success" size="sm">
          Company Rep
        </Badge>
      );
    }
    if (roleStr.includes('student') || role === enRoles.Student || role === 1 || role === '1') {
      return (
        <Badge variant="info" size="sm">
          Student
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm">
        <User className="w-3 h-3 mr-1" /> Basic User
      </Badge>
    );
  };

  const columns: Column<AdminUserListItemDto>[] = [
    {
      header: t('auth.fullName', 'User Information'),
      cell: (item) => {
        const initials = item.name ? item.name.charAt(0).toUpperCase() : 'U';
        const roleStr = String(item.role).toLowerCase();
        const isAdmin = roleStr.includes('admin') || (item.role as any) === 4 || (item.role as any) === '4';
        const isCollege = roleStr.includes('college') || (item.role as any) === 3 || (item.role as any) === '3';
        const isCompany = roleStr.includes('company') || (item.role as any) === 2 || (item.role as any) === '2';
        const isStudent = roleStr.includes('student') || (item.role as any) === 1 || (item.role as any) === '1';

        const avatarBg = isAdmin
          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200'
          : isCollege
          ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200'
          : isCompany
          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200'
          : isStudent
          ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border-sky-200'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';

        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${avatarBg}`}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate">@{item.username}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: t('auth.role', 'Assigned Role'),
      cell: (item) => getRoleBadge(item.role),
    },
    {
      header: 'Affiliation / Faculty',
      cell: (item) => {
        if (item.collegeName) {
          return (
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-xs truncate">
              <School className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{item.collegeName}</span>
            </span>
          );
        }
        if (item.companyName) {
          return (
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-xs truncate">
              <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{item.companyName}</span>
            </span>
          );
        }
        const roleStr = String(item.role).toLowerCase();
        if (roleStr.includes('basic') || (item.role as any) === 5 || (item.role as any) === '5') {
          return <span className="text-slate-400 text-xs italic">Unassigned (Basic User)</span>;
        }
        return <span className="text-slate-400 text-xs">-</span>;
      },
    },
    {
      header: t('common.status', 'Account Status'),
      cell: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'} size="sm">
          {item.isActive ? (
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <UserX className="w-3 h-3" /> Suspended
            </span>
          )}
        </Badge>
      ),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(item.id)}
            title="View User Details"
          >
            <Eye className="w-4 h-4 text-slate-500 hover:text-indigo-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setResetTargetUser(item);
              setResetModalOpen(true);
            }}
            title="Reset Password"
          >
            <KeyRound className="w-4 h-4 text-amber-500 hover:text-amber-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenToggleConfirm(item)}
            title={item.isActive ? 'Deactivate User Account' : 'Activate User Account'}
          >
            <Power className={`w-4 h-4 ${item.isActive ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'}`} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('nav.users', 'User Account Directory & Permissions')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('admin.dashboardSubtitle', 'Manage system identities, grant representative access, reset credentials, and enforce security policies')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            {t('common.refresh', 'Refresh')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateCollegeRepOpen(true)}
            leftIcon={<School className="w-3.5 h-3.5 text-indigo-500" />}
          >
            {t('admin.createCollegeRep', '+ College Rep')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateCompanyRepOpen(true)}
            leftIcon={<Building2 className="w-3.5 h-3.5 text-emerald-500" />}
          >
            {t('admin.createCompanyRep', '+ Company Rep')}
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-slate-400">{t('admin.totalAccounts', 'Total Accounts')}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-emerald-500">{t('admin.activeAccounts', 'Active Accounts')}</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-rose-500">{t('admin.suspendedAccounts', 'Suspended')}</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{inactiveCount}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('admin.basicUsers', 'Basic Users')}</p>
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-0.5">{basicUsersCount}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-sky-500">{t('admin.students', 'Students')}</p>
          <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-0.5">{studentsCount}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-indigo-500">{t('admin.collegeReps', 'College Reps')}</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{collegeRepsCount}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-emerald-500">{t('admin.companyReps', 'Company Reps')}</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{companyRepsCount}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder={t('admin.searchUsersPlaceholder', 'Search by name, username, or faculty...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'all', label: t('admin.allStatuses', 'All Statuses') },
                { value: 'active', label: t('admin.activeOnly', 'Active Only') },
                { value: 'inactive', label: t('admin.inactiveOnly', 'Suspended Only') },
              ]}
              className="w-full sm:w-36"
            />
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 overflow-x-auto pb-1 text-xs">
          {[
            { key: 'all', label: t('admin.allRoles', 'All Roles'), count: totalCount },
            { key: 'BasicUser', label: t('admin.basicUsers', 'Basic Users'), count: basicUsersCount },
            { key: 'Student', label: t('admin.students', 'Students'), count: studentsCount },
            { key: 'CollegeRep', label: t('admin.collegeReps', 'College Representatives'), count: collegeRepsCount },
            { key: 'CompanyRep', label: t('admin.companyReps', 'Company Representatives'), count: companyRepsCount },
            { key: 'SuperAdmin', label: t('roles.superAdmin', 'Administrators') },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                roleFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && <span className="ml-1.5 text-[10px] opacity-75">({tab.count})</span>}
            </button>
          ))}
        </div>
      </Card>

      {/* Users Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        isLoading={loading}
        onRowClick={(item) => handleViewDetails(item.id)}
        emptyMessage={
          searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
            ? 'No users found matching your filter criteria.'
            : 'No users registered in the system yet.'
        }
      />

      {/* User Details Modal */}
      <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="User Account Profile & Credentials" maxWidth="2xl">
        {loadingDetails ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading user profile information...</div>
        ) : selectedUser ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-md shrink-0 ${
                  String(selectedUser.role).toLowerCase().includes('admin') || (selectedUser.role as any) === 4
                    ? 'bg-rose-600 text-white shadow-rose-600/20'
                    : String(selectedUser.role).toLowerCase().includes('college') || (selectedUser.role as any) === 3
                    ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                    : String(selectedUser.role).toLowerCase().includes('company') || (selectedUser.role as any) === 2
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : String(selectedUser.role).toLowerCase().includes('student') || (selectedUser.role as any) === 1
                    ? 'bg-sky-600 text-white shadow-sky-600/20'
                    : 'bg-slate-600 text-white shadow-slate-600/20'
                }`}
              >
                {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{selectedUser.name}</h3>
                  {getRoleBadge(selectedUser.role)}
                  <Badge variant={selectedUser.isActive ? 'success' : 'danger'} size="sm">
                    {selectedUser.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">@{selectedUser.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedUser.email || 'Not specified'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedUser.phoneNumber || 'Not specified'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-indigo-500" /> Associated College
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedUser.collegeName || (String(selectedUser.role).toLowerCase().includes('basic') || (selectedUser.role as any) === 5 ? 'Unassigned (Basic User)' : 'Not linked')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Associated Company
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedUser.companyName || (String(selectedUser.role).toLowerCase().includes('basic') || (selectedUser.role as any) === 5 ? 'Unassigned (Basic User)' : 'Not linked')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResetTargetUser({
                    id: selectedUser.id,
                    name: selectedUser.name,
                    username: selectedUser.username,
                    role: selectedUser.role,
                    isActive: selectedUser.isActive,
                    createdAt: selectedUser.createdAt || '',
                  });
                  setResetModalOpen(true);
                }}
                leftIcon={<KeyRound className="w-3.5 h-3.5 text-amber-500" />}
              >
                Reset Password
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant={selectedUser.isActive ? 'danger' : 'success'}
                  onClick={() =>
                    handleOpenToggleConfirm({
                      id: selectedUser.id,
                      name: selectedUser.name,
                      username: selectedUser.username,
                      role: selectedUser.role,
                      isActive: selectedUser.isActive,
                      createdAt: selectedUser.createdAt || '',
                    })
                  }
                  leftIcon={<Power className="w-3.5 h-3.5" />}
                >
                  {selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Password for ${resetTargetUser?.name || 'User'}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New Password *"
            type="password"
            placeholder="Enter new strong password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="The user will be able to log in immediately using this new password."
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="bg-amber-600 hover:bg-amber-700 text-white">
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={toggleConfirmOpen}
        onClose={() => setToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={targetToggleUser?.isActive ? 'Suspend User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${targetToggleUser?.isActive ? 'suspend' : 'activate'} the account for "${targetToggleUser?.name}" (@${targetToggleUser?.username})?`}
        confirmText={targetToggleUser?.isActive ? 'Suspend Account' : 'Activate Account'}
        variant={targetToggleUser?.isActive ? 'danger' : 'success'}
        isLoading={submitting}
      />

      {/* Create College Rep Modal */}
      <Modal isOpen={createCollegeRepOpen} onClose={() => setCreateCollegeRepOpen(false)} title="Create College Representative Account">
        <form onSubmit={handleCreateCollegeRep} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Dr. Ahmed Al-Ghamdi"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            required
          />
          <Input
            label="Username / Official Email *"
            placeholder="e.g. rep@ccsit.edu.sa"
            value={repEmail}
            onChange={(e) => setRepEmail(e.target.value)}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="Defaults to 123456 if left blank"
            value={repPassword}
            onChange={(e) => setRepPassword(e.target.value)}
          />
          <Select
            label="Associated College *"
            value={selectedCollegeId}
            onChange={(e) => setSelectedCollegeId(e.target.value)}
            placeholder="Select participating college"
            options={colleges.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setCreateCollegeRepOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create Representative
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Company Rep Modal */}
      <Modal isOpen={createCompanyRepOpen} onClose={() => setCreateCompanyRepOpen(false)} title="Create Company Representative Account">
        <form onSubmit={handleCreateCompanyRep} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Eng. Khalid Al-Harbi"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            required
          />
          <Input
            label="Username / Official Email *"
            placeholder="e.g. training@company.com"
            value={repEmail}
            onChange={(e) => setRepEmail(e.target.value)}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="Defaults to 123456 if left blank"
            value={repPassword}
            onChange={(e) => setRepPassword(e.target.value)}
          />
          <Select
            label="Associated Company *"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            placeholder="Select registered partner company"
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setCreateCompanyRepOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Create Representative
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
