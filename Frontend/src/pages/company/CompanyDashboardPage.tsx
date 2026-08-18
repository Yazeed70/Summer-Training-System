import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  FileSpreadsheet,
  FileText,
  UserPlus,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Search,
  GraduationCap,
  Briefcase,
  School,
  Mail,
  Phone,
  User,
  Info,
} from 'lucide-react';
import { companyService } from '../../api/companyService';
import { reportsService } from '../../api/reportsService';
import {
  CompanyDetailsDto,
  CompanyStudentsListDto,
  StudentProfileResponseDto,
} from '../../types/dashboard';
import { CollegeReportTemplateDto, CompanyStudentReportDto } from '../../types/reports';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

export const CompanyDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CompanyDetailsDto | null>(null);
  const [trainees, setTrainees] = useState<CompanyStudentsListDto[]>([]);
  const [templates, setTemplates] = useState<CollegeReportTemplateDto[]>([]);
  const [reports, setReports] = useState<CompanyStudentReportDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  // Trainee Profile Modal State
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfileResponseDto | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profData, traineesData, templatesData, reportsData] = await Promise.all([
        companyService.getCompanyProfile().catch(() => null),
        companyService.getCompanyStudents().catch(() => []),
        reportsService.getCompanyTemplates().catch(() => []),
        reportsService.getCompanyReports().catch(() => []),
      ]);

      if (profData) setProfile(profData);
      setTrainees(traineesData || []);
      setTemplates(templatesData || []);
      setReports(reportsData || []);
    } catch (err) {
      console.error('Failed to load company dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenStudentProfile = async (pubId: string, fallbackName?: string) => {
    try {
      setLoadingProfile(true);
      setProfileModalOpen(true);
      const profile = await companyService.getStudentProfile(pubId);
      setSelectedStudentProfile(profile);
    } catch (err) {
      console.error(err);
      setSelectedStudentProfile({
        id: pubId,
        name: fallbackName || 'Trainee Student',
        username: pubId,
        collegeName: 'Enrolled College',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const filteredTrainees = useMemo(() => {
    if (!searchQuery.trim()) return trainees.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return trainees
      .filter(
        (t) =>
          t.studentName.toLowerCase().includes(q) ||
          (t.collegeName && t.collegeName.toLowerCase().includes(q)) ||
          (t.major && t.major.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [trainees, searchQuery]);

  const pendingEvaluationsCount = useMemo(() => {
    return reports.filter((r) => !r.companyScore && !r.evaluationScore).length;
  }, [reports]);

  const traineeColumns: Column<CompanyStudentsListDto>[] = [
    {
      header: 'Trainee Student',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStudentProfile(item.studentPublicId, item.studentName);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view full student profile"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-xs shrink-0 group-hover:ring-2 group-hover:ring-emerald-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {item.studentName}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{item.studentPublicId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'College',
      cell: (item) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">{item.collegeName || '-'}</span>
      ),
    },
    {
      header: 'Major',
      cell: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">{item.major || 'Specialization'}</span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.trainingStatus === 'Active' || (item.trainingStatus as any) === 2 ? 'success' : 'neutral'} size="sm">
          {item.trainingStatus || 'Active'}
        </Badge>
      ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenStudentProfile(item.studentPublicId, item.studentName)}
          title="View Details"
          className="text-slate-500 hover:text-emerald-600"
        >
          <Info className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('nav.dashboard', 'Company Dashboard')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Corporate overview, trainee placement oversight, periodic report evaluations & performance tracking
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
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/company/trainees')}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-md"
          >
            Assign Trainee
          </Button>
        </div>
      </div>

      {/* Top Grid: Profile Card & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 space-y-4">
          <div
            onClick={() => navigate('/company/profile')}
            className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-all"
            title="Click to manage company information"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white rounded-xl transition-all shadow-xs shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 truncate">
                <span className="truncate">{profile?.name || 'My Company'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity shrink-0" />
              </h2>
              <p className="text-xs text-slate-400 truncate">Corporate Partner</p>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-slate-400">Headquarters Address</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {profile?.address || '-'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Official Contact Email</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {profile?.contactEmail || '-'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Accreditation Status</p>
              <div className="mt-1">
                <Badge variant={profile?.isApproved ? 'success' : 'warning'} size="sm">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {profile?.isApproved ? 'Approved Partner' : 'Verification Pending'}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => navigate('/company/profile')}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Manage Corporate Profile
          </Button>
        </Card>

        {/* KPI Cards Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card
            onClick={() => navigate('/company/trainees')}
            className="p-4 cursor-pointer group hover:border-emerald-300 dark:hover:border-emerald-800 transition-all bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-emerald-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Trainees</span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{trainees.length}</span>
              <span className="text-xs text-emerald-600 font-medium">currently placed</span>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/company/templates')}
            className="p-4 cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-800 transition-all bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Report Templates</span>
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{templates.length}</span>
              <span className="text-xs text-slate-400">evaluation forms</span>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/company/evaluations')}
            className="p-4 cursor-pointer group hover:border-amber-300 dark:hover:border-amber-800 transition-all bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-amber-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review</span>
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{pendingEvaluationsCount}</span>
              <span className="text-xs text-amber-600 font-medium">reports awaiting review</span>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/company/evaluations')}
            className="p-4 cursor-pointer group hover:border-teal-300 dark:hover:border-teal-800 transition-all bg-gradient-to-br from-teal-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-teal-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submissions</span>
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{reports.length}</span>
              <span className="text-xs text-slate-400">trainee submissions</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Trainees Roster Quick Overview Section */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Trainees Overview</h3>
              <Badge variant="success" size="sm">
                {trainees.length} Total
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {trainees.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search trainees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/company/trainees')}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                View All
              </Button>
            </div>
          </div>
        }
      >
        <Table<CompanyStudentsListDto>
          columns={traineeColumns}
          data={filteredTrainees}
          keyExtractor={(item) => item.studentPublicId}
          isLoading={loading}
          onRowClick={(item) => handleOpenStudentProfile(item.studentPublicId, item.studentName)}
          emptyMessage={
            searchQuery
              ? 'No matching trainees found.'
              : 'No trainees assigned to company yet. Use the Assign Trainee button to link students.'
          }
        />
      </Card>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="p-5 flex items-center justify-between gap-4 border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50/40 to-white dark:from-slate-900 dark:to-slate-850"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-emerald-600/20 shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Create Evaluation Template</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Design custom dynamic questionnaires and periodic evaluation forms
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/company/templates')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Create
          </Button>
        </Card>

        <Card
          className="p-5 flex items-center justify-between gap-4 border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/40 to-white dark:from-slate-900 dark:to-slate-850"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-indigo-600/20 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Review Trainee Reports</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review submitted questionnaires and provide supervisor performance ratings
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/company/evaluations')}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Review ({pendingEvaluationsCount})
          </Button>
        </Card>
      </div>

      {/* Trainee Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Trainee Profile & Academic Information"
      >
        {loadingProfile ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading trainee profile...</div>
        ) : selectedStudentProfile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-base shrink-0">
                {selectedStudentProfile.name ? selectedStudentProfile.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white text-base leading-tight truncate">
                  {selectedStudentProfile.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  ID: {selectedStudentProfile.universityIdNumber || selectedStudentProfile.id}
                </p>
              </div>
              {selectedStudentProfile.gpa !== undefined && selectedStudentProfile.gpa !== null && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">GPA</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {Number(selectedStudentProfile.gpa).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> University ID
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono block">
                  {selectedStudentProfile.universityIdNumber || 'Not Specified'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Major
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.major || 'Undergraduate Student'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50 col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <School className="w-3.5 h-3.5" /> College
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedStudentProfile.collegeName || 'Enrolled College'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Official Email
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.email || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.phoneNumber || '-'}
                </span>
              </div>
            </div>

            {selectedStudentProfile.activeTraining && (
              <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {selectedStudentProfile.activeTraining.companyName || 'Assigned Company'}
                  </span>
                  <Badge variant="success">{selectedStudentProfile.activeTraining.trainingStatus}</Badge>
                </div>
                {selectedStudentProfile.activeTraining.startDate && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Period: {selectedStudentProfile.activeTraining.startDate} → {selectedStudentProfile.activeTraining.endDate || 'Ongoing'}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setProfileModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
