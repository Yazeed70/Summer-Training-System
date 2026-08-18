import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  User,
  UserCheck,
  ArrowUpRight,
  Clock,
  XCircle,
  KeyRound,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Copy,
  Check,
  Sparkles,
  Lock,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { userService } from '../../api/userService';
import { enRoles, enRequestStatus } from '../../types/enums';
import { UserProfileResponseDto, UpgradeRequestDetailsDto } from '../../types/dashboard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<UserProfileResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Upgrade status
  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeRequestDetailsDto | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Profile update fields
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfileAndStatus = async () => {
    try {
      setLoading(true);
      const [profRes, statusRes] = await Promise.all([
        userService.getUserProfile(),
        userService.getUpgradeStatus().catch(() => null),
      ]);
      setProfile(profRes);
      setName(profRes.name);
      setUpgradeStatus(statusRes);
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStatus();
  }, []);

  const handleCopyPublicId = () => {
    if (profile?.publicId) {
      navigator.clipboard.writeText(profile.publicId);
      setCopiedId(true);
      toast.success(t('common.copied', 'Account ID copied to clipboard'));
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const onUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }
    try {
      setUpdatingName(true);
      await userService.updateUserProfile({
        name: name.trim(),
      });
      toast.success('Display name updated successfully');
      fetchProfileAndStatus();
    } catch (err) {
      console.error('Failed to update name:', err);
    } finally {
      setUpdatingName(false);
    }
  };

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    try {
      setUpdatingPassword(true);
      await userService.updateUserProfile({
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to change password:', err);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleConfirmCancelRequest = async () => {
    if (!upgradeStatus) return;
    try {
      setCanceling(true);
      await userService.cancelUpgradeRequest(upgradeStatus.id);
      toast.success('Upgrade request canceled successfully');
      setCancelConfirmOpen(false);
      fetchProfileAndStatus();
    } catch (err) {
      console.error('Failed to cancel upgrade request:', err);
    } finally {
      setCanceling(false);
    }
  };

  const isPendingUpgrade =
    upgradeStatus &&
    (upgradeStatus.status === enRequestStatus.Pending ||
      (upgradeStatus.status as any) === 1 ||
      String(upgradeStatus.status).toLowerCase() === 'pending');

  const isApprovedUpgrade =
    upgradeStatus &&
    (upgradeStatus.status === enRequestStatus.Approved ||
      (upgradeStatus.status as any) === 2 ||
      String(upgradeStatus.status).toLowerCase() === 'approved');

  const isDeletedUpgrade =
    upgradeStatus &&
    (upgradeStatus.status === enRequestStatus.Deleted ||
      (upgradeStatus.status as any) === 4 ||
      String(upgradeStatus.status).toLowerCase() === 'deleted' ||
      String(upgradeStatus.status).toLowerCase() === 'canceled');

  const getRoleTheme = (role?: enRoles) => {
    switch (role) {
      case enRoles.SuperAdmin:
        return {
          gradient: 'from-rose-950 via-slate-900 to-slate-900',
          border: 'border-rose-500/20',
          avatar: 'bg-rose-600 shadow-rose-600/30',
          badgeVariant: 'danger' as const,
          label: t('roles.superAdmin', 'Super Administrator'),
        };
      case enRoles.CollegeRep:
        return {
          gradient: 'from-indigo-950 via-slate-900 to-slate-900',
          border: 'border-indigo-500/20',
          avatar: 'bg-indigo-600 shadow-indigo-600/30',
          badgeVariant: 'indigo' as const,
          label: t('roles.collegeRep', 'College Representative'),
        };
      case enRoles.CompanyRep:
        return {
          gradient: 'from-emerald-950 via-slate-900 to-slate-900',
          border: 'border-emerald-500/20',
          avatar: 'bg-emerald-600 shadow-emerald-600/30',
          badgeVariant: 'success' as const,
          label: t('roles.companyRep', 'Company Representative'),
        };
      case enRoles.Student:
        return {
          gradient: 'from-sky-950 via-slate-900 to-slate-900',
          border: 'border-sky-500/20',
          avatar: 'bg-sky-600 shadow-sky-600/30',
          badgeVariant: 'info' as const,
          label: t('roles.student', 'University Student'),
        };
      case enRoles.BasicUser:
      default:
        return {
          gradient: 'from-slate-900 via-indigo-950/40 to-slate-900',
          border: 'border-slate-700/50',
          avatar: 'bg-slate-700 shadow-slate-700/30',
          badgeVariant: 'neutral' as const,
          label: t('roles.basicUser', 'Basic User (Unassigned)'),
        };
    }
  };

  const roleStyle = getRoleTheme(user?.role);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('profile.pageTitle', 'Personal Profile & Security')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('profile.pageSubtitle', 'Manage your account identity, security credentials, contact details, and role upgrade status')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProfileAndStatus}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            {t('common.refresh', 'Refresh')}
          </Button>

          {user?.role === enRoles.BasicUser && (
            <Button
              size="sm"
              onClick={() => navigate('/user/upgrades')}
              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-md"
            >
              {t('nav.roleUpgradeCenter', 'Role Upgrade Center')}
            </Button>
          )}
        </div>
      </div>

      {/* Hero Overview Profile Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${roleStyle.gradient} p-6 text-white border ${roleStyle.border} shadow-xl`}
      >
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl ${roleStyle.avatar} text-white flex items-center justify-center font-extrabold text-2xl shadow-lg border border-white/20 shrink-0`}
            >
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {profile?.name || 'User Profile'}
                </h2>
                <Badge variant={roleStyle.badgeVariant} size="sm">
                  {profile?.roleName || roleStyle.label}
                </Badge>
                <Badge variant="success" size="sm" className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {t('common.active', 'Active')}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap pt-0.5">
                <span className="font-mono text-indigo-200">@{profile?.username}</span>
                {profile?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{profile.email}</span>
                  </span>
                )}
                {profile?.createdAt && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats on Right */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {user?.role === enRoles.BasicUser && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate('/user/upgrades')}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              >
                {t('auth.requestRoleUpgrade', 'Apply for Upgrade')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active Upgrade Status Banner (For users with pending/handled requests) */}
      {upgradeStatus && !isDeletedUpgrade && (
        <Card
          className={`p-4 ${
            isPendingUpgrade
              ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
              : isApprovedUpgrade
              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
              : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isPendingUpgrade
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
                    : isApprovedUpgrade
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {t('profile.upgradeStatusTitle', 'Latest Role Upgrade')}: {upgradeStatus.requestedRole}
                  </span>
                  <Badge
                    variant={isPendingUpgrade ? 'warning' : isApprovedUpgrade ? 'success' : 'danger'}
                    size="sm"
                  >
                    {isPendingUpgrade ? t('common.pending', 'Pending Review') : isApprovedUpgrade ? t('common.approved', 'Approved') : t('common.rejected', 'Rejected')}
                  </Badge>
                </div>

                <p className="text-slate-500 dark:text-slate-400">
                  {t('profile.targetEntity', 'Target Entity')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{upgradeStatus.collegeName || upgradeStatus.companyName || '-'}</span>
                  {upgradeStatus.officialEmail && (
                    <span> • {t('profile.officialEmail', 'Official Email')}: <span className="font-mono">{upgradeStatus.officialEmail}</span></span>
                  )}
                  {upgradeStatus.createdAt && (
                    <span> • {t('profile.submissionDate', 'Submitted on')} {new Date(upgradeStatus.createdAt).toLocaleDateString()}</span>
                  )}
                </p>

                {upgradeStatus.comment && (
                  <p className="text-amber-800 dark:text-amber-300 font-medium pt-0.5">
                    {t('profile.reviewerNote', 'Reviewer Note')}: {upgradeStatus.comment}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/user/upgrades')}
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                {t('profile.viewInUpgradeCenter', 'Upgrade Center')}
              </Button>

              {isPendingUpgrade && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  onClick={() => setCancelConfirmOpen(true)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  {t('profile.cancelRequest', 'Cancel Request')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Grid: Identity Info on Left, Forms on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Information Card */}
        <div className="space-y-6">
          <Card
            header={
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('profile.accountInfo', 'Account Information')}</h3>
              </div>
            }
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium block">{t('profile.publicId', 'Public Account GUID')}</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 truncate">
                    {profile?.publicId || '-'}
                  </span>
                  <button
                    onClick={handleCopyPublicId}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title={t('common.copy', 'Copy Account ID')}
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> {t('auth.username', 'Username')}
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 block">
                  @{profile?.username}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-sky-500" /> {t('profile.primaryEmail', 'Primary Email')}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block truncate">
                  {profile?.email || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" /> {t('profile.phoneNumber', 'Phone Number')}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block truncate">
                  {profile?.phoneNumber || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> {t('profile.authorityLevel', 'Current Authority Level')}
                </span>
                <Badge variant={roleStyle.badgeVariant} size="sm">
                  {profile?.roleName || roleStyle.label}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Edit Name & Security Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Display Name Card */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('profile.personalInfo', 'Personal Information')}</h3>
              </div>
            }
          >
            <form onSubmit={onUpdateName} className="space-y-4">
              <Input
                label={t('auth.fullName', 'Full Display Name *')}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder', 'e.g. Dr. Ahmed Al-Ghamdi')}
                required
              />

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  isLoading={updatingName}
                  disabled={name === profile?.name}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-sm"
                >
                  {t('profile.saveName', 'Save Name Changes')}
                </Button>
              </div>
            </form>
          </Card>

          {/* Security & Password Card */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('profile.securityManagement', 'Security & Password Management')}</h3>
              </div>
            }
          >
            <form onSubmit={onUpdatePassword} className="space-y-4">
              <Input
                label={t('profile.currentPassword', 'Current Password *')}
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('profile.newPassword', 'New Password *')}
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label={t('profile.confirmNewPassword', 'Confirm New Password *')}
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{t('profile.passwordTip', 'Tip: Ensure your password is at least 6 characters long.')}</span>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  isLoading={updatingPassword}
                  disabled={!currentPassword || !newPassword}
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 shadow-sm"
                >
                  {t('profile.updatePassword', 'Update Password')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Cancel Request Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancelRequest}
        title={t('profile.cancelRequest', 'Cancel Pending Upgrade Request')}
        message="Are you sure you want to cancel your pending role upgrade request? You can submit a new application anytime."
        confirmText={t('profile.cancelRequest', 'Cancel Request')}
        variant="danger"
        isLoading={canceling}
      />
    </div>
  );
};
