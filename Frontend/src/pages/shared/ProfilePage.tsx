import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { User, UserCheck, ArrowUpRight, Clock, XCircle } from 'lucide-react';
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
  const [updating, setUpdating] = useState(false);

  // Upgrade status
  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeRequestDetailsDto | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Profile update fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStatus();
  }, []);

  const onUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await userService.updateUserProfile({
        name: name || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      toast.success('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      fetchProfileAndStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
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
      console.error(err);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('common.profile')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your account details and role upgrade applications
          </p>
        </div>

        {user?.role === enRoles.BasicUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/user/upgrades')}
            leftIcon={<UserCheck className="w-4 h-4 text-indigo-500" />}
          >
            Role Upgrade Center
          </Button>
        )}
      </div>

      {/* Upgrade Status Banner */}
      {upgradeStatus && (
        <Card className="p-4 border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Upgrade Request: {upgradeStatus.requestedRole}
                  </span>
                  <Badge
                    variant={
                      upgradeStatus.status === enRequestStatus.Approved || (upgradeStatus.status as any) === 2 || String(upgradeStatus.status).toLowerCase() === 'approved'
                        ? 'success'
                        : upgradeStatus.status === enRequestStatus.Rejected || (upgradeStatus.status as any) === 3 || String(upgradeStatus.status).toLowerCase() === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {upgradeStatus.status === enRequestStatus.Approved || (upgradeStatus.status as any) === 2 || String(upgradeStatus.status).toLowerCase() === 'approved'
                      ? 'Approved'
                      : upgradeStatus.status === enRequestStatus.Rejected || (upgradeStatus.status as any) === 3 || String(upgradeStatus.status).toLowerCase() === 'rejected'
                      ? 'Rejected'
                      : 'Pending Review'}
                  </Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Target Entity: {upgradeStatus.collegeName || upgradeStatus.companyName || '-'} • Official Email: {upgradeStatus.officialEmail}
                </p>
                {upgradeStatus.comment && (
                  <p className="text-amber-700 dark:text-amber-400 font-semibold">
                    Feedback: {upgradeStatus.comment}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 hover:text-indigo-700"
                onClick={() => navigate('/user/upgrades')}
                leftIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                View in Upgrade Center
              </Button>

              {(upgradeStatus.status === enRequestStatus.Pending || (upgradeStatus.status as any) === 1 || String(upgradeStatus.status).toLowerCase() === 'pending') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => setCancelConfirmOpen(true)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Cancel Request
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="md:col-span-1 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
            {profile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{profile?.name}</h2>
            <p className="text-xs text-slate-400">@{profile?.username}</p>
            <p className="text-xs text-slate-400">{profile?.email || 'No email specified'}</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <Badge variant="indigo">{profile?.roleName || 'Basic User'}</Badge>
          </div>
        </Card>

        {/* Update Form */}
        <Card className="md:col-span-2">
          <form onSubmit={onUpdateProfile} className="space-y-4">
            <Input
              label={t('auth.fullName')}
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={updating}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Cancel Request Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancelRequest}
        title="Cancel Pending Upgrade Request"
        message="Are you sure you want to cancel your pending role upgrade request?"
        confirmText="Cancel Request"
        variant="danger"
        isLoading={canceling}
      />
    </div>
  );
};

