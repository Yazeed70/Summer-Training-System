import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  School,
  Building2,
  Mail,
  MapPin,
  Save,
  Users,
  FileText,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collegeService } from '../../api/collegeService';
import { CollegeDetailsDto, CreateCollegeDto, CollegeDocumentDto } from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const CollegeProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CollegeDetailsDto | null>(null);
  const [documents, setDocuments] = useState<CollegeDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, docsRes] = await Promise.all([
        collegeService.getCollegeProfile().catch(() => null),
        collegeService.getDocuments().catch(() => []),
      ]);

      if (profileRes) {
        setProfile(profileRes);
        setName(profileRes.name || '');
        setContactEmail(profileRes.contactEmail || '');
        setAddress(profileRes.address || '');
      }
      setDocuments(docsRes || []);
    } catch (err: any) {
      console.error('Failed to load college profile data:', err);
      toast.error('Failed to load college information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('College name is required');
      return;
    }

    try {
      setSaving(true);
      const dto: CreateCollegeDto = {
        name: name.trim(),
        contactEmail: contactEmail.trim() || undefined,
        address: address.trim() || undefined,
      };

      await collegeService.updateCollegeProfile(dto);
      toast.success('College information updated successfully');
      fetchData();
    } catch (err: any) {
      console.error('Failed to update college:', err);
      const msg =
        err.response?.data?.devMessage ||
        err.response?.data?.message ||
        'Failed to save changes. Please try again.';
      toast.error(msg);
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
            {t('nav.collegeProfile', 'College Information Management')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Update institutional details, official contact channels, and view active enrollment metrics
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          isLoading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Hero Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 text-white border border-indigo-500/20 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 backdrop-blur-md text-indigo-300 shrink-0 shadow-lg">
              <School className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {profile?.name || 'College Management'}
                </h2>
                <Badge variant="indigo" size="sm" className="bg-indigo-500/20 border-indigo-400/30 text-indigo-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  College Representative
                </Badge>
              </div>
              <p className="text-xs text-indigo-200/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span>{profile?.address || 'Campus Location Not Specified'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] uppercase font-semibold text-indigo-200/70">Enrolled Students</p>
              <p className="text-lg font-bold text-white mt-0.5">{profile?.totalStudents ?? 0}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] uppercase font-semibold text-indigo-200/70">Guidelines Docs</p>
              <p className="text-lg font-bold text-white mt-0.5">{documents.length}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-semibold text-indigo-200/70">College ID</p>
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
                <Building2 className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit College Information</h3>
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
                label="College Name *"
                placeholder="e.g. College of Computer & Information Sciences"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                helperText="Official university name of the college or academic faculty."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Contact Email"
                  type="email"
                  placeholder="e.g. ccsit-training@university.edu.sa"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  helperText="Primary email used for students & system notifications."
                />

                <Input
                  label="Campus Address / Building"
                  placeholder="e.g. Building 31, Main Campus, Riyadh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                  helperText="Physical office or campus location."
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                Changes saved here will automatically reflect across all student dashboards, training approval letters, and generated reports linked to this college.
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
                className="shadow-indigo-600/20 shadow-md"
              >
                Save College Information
              </Button>
            </div>
          </form>
        </Card>

        {/* Right 1 Col: Institutional Quick Links & Guidelines */}
        <div className="space-y-6">
          <Card
            header={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Training Guidelines & Docs</h3>
              </div>
            }
          >
            <div className="space-y-3 text-xs">
              <p className="text-slate-500 dark:text-slate-400">
                You have uploaded <strong className="text-slate-800 dark:text-white">{documents.length}</strong> guideline documents for this college.
              </p>

              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{doc.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/college')}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Manage Guidelines in Dashboard
              </Button>
            </div>
          </Card>

          <Card
            header={
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Enrollment</h3>
              </div>
            }
          >
            <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                <span className="font-medium text-slate-700 dark:text-slate-300">Active Students</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                  {profile?.totalStudents ?? 0}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed">
                Students linked to your college can view official manuals and submit summer training applications for review.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/college/students')}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                View Student Roster
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
