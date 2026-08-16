import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Users, UserPlus, KeyRound, Power, Eye, Search } from 'lucide-react';
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

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailsDto | null>(null);
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
      console.error(err);
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
      result = result.filter((u) => String(u.role).toLowerCase() === targetRoleStr);
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
  }, [roleFilter, searchQuery, users]);

  const handleOpenToggleConfirm = (user: AdminUserListItemDto) => {
    setTargetToggleUser(user);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetToggleUser) return;
    try {
      setSubmitting(true);
      const res = await adminService.toggleUserStatus(targetToggleUser.id);
      toast.success(`User status updated to ${res.newStatus}`);
      setToggleConfirmOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (publicId: string) => {
    try {
      const details = await adminService.getUserDetails(publicId);
      setSelectedUser(details);
      setDetailsModalOpen(true);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCollegeRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName || !repEmail || !selectedCollegeId) {
      toast.error('Please fill in all required fields');
      return;
    }
    const selectedCollege = colleges.find((c) => String(c.id) === selectedCollegeId);
    try {
      setSubmitting(true);
      await adminService.createCollegeRep({
        name: repName,
        username: repEmail,
        password: repPassword || '123456',
        confirmPassword: repPassword || '123456',
        collegeName: selectedCollege ? selectedCollege.name : '',
      });
      toast.success('College Representative created');
      setCreateCollegeRepOpen(false);
      setRepName('');
      setRepEmail('');
      setRepPassword('');
      setSelectedCollegeId('');
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCompanyRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName || !repEmail || !selectedCompanyId) {
      toast.error('Please fill in all required fields');
      return;
    }
    const selectedCompany = companies.find((c) => String(c.id) === selectedCompanyId);
    try {
      setSubmitting(true);
      await adminService.createCompanyRep({
        name: repName,
        username: repEmail,
        password: repPassword || '123456',
        confirmPassword: repPassword || '123456',
        companyName: selectedCompany ? selectedCompany.name : '',
      });
      toast.success('Company Representative created');
      setCreateCompanyRepOpen(false);
      setRepName('');
      setRepEmail('');
      setRepPassword('');
      setSelectedCompanyId('');
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<AdminUserListItemDto>[] = [
    {
      header: t('auth.fullName'),
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
          <p className="text-xs text-slate-400">@{item.username}</p>
        </div>
      ),
    },
    {
      header: t('auth.role'),
      cell: (item) => {
        const roleStr = String(item.role).toLowerCase();
        let variant: 'danger' | 'indigo' | 'success' | 'info' | 'neutral' = 'neutral';
        if (roleStr.includes('admin')) variant = 'danger';
        else if (roleStr.includes('college')) variant = 'indigo';
        else if (roleStr.includes('company')) variant = 'success';
        else if (roleStr.includes('student')) variant = 'info';

        return <Badge variant={variant}>{item.role}</Badge>;
      },
    },
    {
      header: 'Affiliation',
      cell: (item) => item.collegeName || item.companyName || '-',
    },
    {
      header: t('common.status'),
      cell: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? t('common.active') : t('common.inactive')}
        </Badge>
      ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(item.id)}
            title="View Details"
          >
            <Eye className="w-4 h-4 text-slate-500" />
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
            <KeyRound className="w-4 h-4 text-amber-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenToggleConfirm(item)}
            title={item.isActive ? 'Deactivate User' : 'Activate User'}
          >
            <Power className={`w-4 h-4 ${item.isActive ? 'text-rose-500' : 'text-emerald-500'}`} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.users')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage system users, activate/deactivate accounts, and create representatives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateCollegeRepOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4 text-indigo-500" />}
          >
            + College Rep
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateCompanyRepOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4 text-emerald-500" />}
          >
            + Company Rep
          </Button>
        </div>
      </div>

      {/* Filters & Search Header */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by name, username, college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'Student', label: t('roles.student') },
                { value: 'CollegeRep', label: t('roles.collegeRep') },
                { value: 'CompanyRep', label: t('roles.companyRep') },
                { value: 'SuperAdmin', label: t('roles.superAdmin') },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        isLoading={loading}
      />

      {/* Status Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={toggleConfirmOpen}
        onClose={() => setToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={targetToggleUser?.isActive ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${targetToggleUser?.isActive ? 'deactivate' : 'activate'} account for "${targetToggleUser?.name}" (@${targetToggleUser?.username})?`}
        confirmText={targetToggleUser?.isActive ? 'Deactivate' : 'Activate'}
        variant={targetToggleUser?.isActive ? 'danger' : 'success'}
        isLoading={submitting}
      />

      {/* User Details Modal */}
      <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="User Profile Details">
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Full Name</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Username</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-slate-400">Email</p>
                <p className="font-semibold">{selectedUser.email || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="font-semibold">{selectedUser.phoneNumber || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">College</p>
                <p className="font-semibold">{selectedUser.collegeName || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Company</p>
                <p className="font-semibold">{selectedUser.companyName || '-'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title={`Reset Password for ${resetTargetUser?.name || ''}`}>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new strong password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create College Rep Modal */}
      <Modal isOpen={createCollegeRepOpen} onClose={() => setCreateCollegeRepOpen(false)} title="Create College Representative">
        <form onSubmit={handleCreateCollegeRep} className="space-y-4">
          <Input label="Full Name" value={repName} onChange={(e) => setRepName(e.target.value)} required />
          <Input label="Username / Email" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Defaults to 123456" value={repPassword} onChange={(e) => setRepPassword(e.target.value)} />
          <Select
            label="College"
            value={selectedCollegeId}
            onChange={(e) => setSelectedCollegeId(e.target.value)}
            placeholder="Select College"
            options={colleges.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setCreateCollegeRepOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Representative
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Company Rep Modal */}
      <Modal isOpen={createCompanyRepOpen} onClose={() => setCreateCompanyRepOpen(false)} title="Create Company Representative">
        <form onSubmit={handleCreateCompanyRep} className="space-y-4">
          <Input label="Full Name" value={repName} onChange={(e) => setRepName(e.target.value)} required />
          <Input label="Username / Email" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Defaults to 123456" value={repPassword} onChange={(e) => setRepPassword(e.target.value)} />
          <Select
            label="Company"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            placeholder="Select Company"
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setCreateCompanyRepOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Representative
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
