import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
  FileSpreadsheet,
  Save,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { companyService } from '../../api/companyService';
import { CompanyDetailsDto, CreateCompanyDto } from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const CompanyProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CompanyDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields State (Matching backend database schema: Name, ContactEmail, Address)
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanyProfile();
      setProfile(data);
      setName(data.name || '');
      setContactEmail(data.contactEmail || '');
      setAddress(data.address || '');
    } catch (err) {
      console.error('Failed to fetch company profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!address.trim()) {
      toast.error('Company address is required');
      return;
    }

    try {
      setSaving(true);
      const dto: CreateCompanyDto = {
        name: name.trim(),
        contactEmail: contactEmail.trim() || undefined,
        address: address.trim(),
      };

      await companyService.updateCompanyProfile(dto);
      toast.success('Company profile updated successfully');
      fetchProfile();
    } catch (err) {
      console.error('Failed to update company profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setName(profile.name || '');
      setContactEmail(profile.contactEmail || '');
      setAddress(profile.address || '');
      toast.info('Form fields reset to current profile values');
    }
  };

  const isFormDirty =
    profile &&
    (name !== (profile.name || '') ||
      contactEmail !== (profile.contactEmail || '') ||
      address !== (profile.address || ''));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('nav.companyProfile', 'Company Information Management')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage corporate profile details, physical headquarters address, contact information, and active trainee placements
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchProfile}
          isLoading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Hero Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 text-white border border-emerald-500/20 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 backdrop-blur-md text-emerald-300 shrink-0 shadow-lg">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {profile?.name || 'Corporate Partner'}
                </h2>
                <Badge
                  variant={profile?.isApproved ? 'success' : 'warning'}
                  size="sm"
                  className={profile?.isApproved ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200' : ''}
                >
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {profile?.isApproved ? 'Approved Training Partner' : 'Verification Pending'}
                </Badge>
              </div>
              <p className="text-xs text-emerald-200/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>{profile?.address || 'Headquarters Location Not Specified'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] uppercase font-semibold text-emerald-200/70">Active Trainees</p>
              <p className="text-lg font-bold text-white mt-0.5">{profile?.totalStudents ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] uppercase font-semibold text-emerald-200/70">Partner Status</p>
              <p className="text-xs font-bold text-emerald-300 mt-1.5">
                {profile?.isApproved ? 'Verified Partner' : 'In Review'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-semibold text-emerald-200/70">Company ID</p>
              <p className="text-lg font-bold text-white mt-0.5">#{profile?.id || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Edit Form */}
        <Card
          className="lg:col-span-2"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Corporate Information</h3>
              </div>
              {isFormDirty && (
                <Badge variant="warning" size="sm">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          }
        >
          <form onSubmit={handleSaveChanges} className="space-y-5">
            <div className="space-y-4">
              <Input
                label="Company / Enterprise Name *"
                placeholder="e.g. Saudi Aramco / STC / Advanced Electronics Company"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                helperText="Official registered trade name of the training partner entity."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Contact Email"
                  type="email"
                  placeholder="e.g. training@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  helperText="Primary email used for trainee notifications & evaluations."
                />

                <Input
                  label="Headquarters / Office Address *"
                  placeholder="e.g. King Fahd Road, Al Olaya District, Riyadh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                  required
                  helperText="Physical office or training facility location."
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Changes saved here will automatically reflect across trainee portals, university coordination channels, and periodic evaluation forms linked to this company.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={!isFormDirty || saving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                isLoading={saving}
                leftIcon={<Save className="w-4 h-4" />}
                className="shadow-emerald-600/20 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Company Information
              </Button>
            </div>
          </form>
        </Card>

        {/* Right 1 Col: Quick Links & Trainees Overview */}
        <div className="space-y-6">
          <Card
            header={
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Trainee Placements</h3>
              </div>
            }
          >
            <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                <span className="font-medium text-slate-700 dark:text-slate-300">Enrolled Trainees</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {profile?.totalStudents ?? 0}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed">
                Review assigned university students, monitor internship periods, and link new trainees via public student GUIDs.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/company/trainees')}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Manage Trainees Roster
              </Button>
            </div>
          </Card>

          <Card
            header={
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Evaluation Forms & Logs</h3>
              </div>
            }
          >
            <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <p className="text-[11px] leading-relaxed">
                Create custom company evaluation questionnaires, periodic weekly logs, and rate trainee performance for universities.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/company/templates')}
                  rightIcon={<ExternalLink className="w-3 h-3" />}
                >
                  Templates
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/company/evaluations')}
                  rightIcon={<ExternalLink className="w-3 h-3" />}
                >
                  Evaluations
                </Button>
              </div>
            </div>
          </Card>

          {/* <Card
            header={
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Partner Verification</h3>
              </div>
            }
          >
            <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Account Status:</span>
                <Badge variant={profile?.isActive ? 'success' : 'neutral'} size="sm">
                  {profile?.isActive ? 'Active Partner' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>University Accreditation:</span>
                <Badge variant={profile?.isApproved ? 'success' : 'warning'} size="sm">
                  {profile?.isApproved ? 'Approved Partner' : 'Pending Approval'}
                </Badge>
              </div>
              {profile?.createdAt && (
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Registered On:
                  </span>
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {profile?.approvedAt && (
                <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Approved On:
                  </span>
                  <span>{new Date(profile.approvedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card> */}
        </div>
      </div>
    </div>
  );
};
