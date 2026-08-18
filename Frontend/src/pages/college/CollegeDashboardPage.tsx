import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Building2,
  Upload,
  FileText,
  Trash2,
  Search,
  ExternalLink,
  Eye,
  Clock,
  BookOpen,
  School,
  ShieldCheck,
  Users,
  Briefcase,
  FileSpreadsheet,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { collegeService } from '../../api/collegeService';
import { trainingService } from '../../api/trainingService';
import { reportsService } from '../../api/reportsService';
import { CollegeDetailsDto, CollegeDocumentDto, CollegeStudentsUpgradeRequestsListDto } from '../../types/dashboard';
import { PendingTrainingRequestDto } from '../../types/training';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { FileViewerModal } from '../../components/ui/FileViewerModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const CollegeDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CollegeDetailsDto | null>(null);
  const [documents, setDocuments] = useState<CollegeDocumentDto[]>([]);
  const [pendingStudentUpgrades, setPendingStudentUpgrades] = useState<CollegeStudentsUpgradeRequestsListDto[]>([]);
  const [pendingTrainingRequests, setPendingTrainingRequests] = useState<PendingTrainingRequestDto[]>([]);
  const [templatesCount, setTemplatesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Document Search & Viewer state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [viewingTitle, setViewingTitle] = useState('College_Document');

  // Delete Confirm Modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteDocId, setTargetDeleteDocId] = useState<number | null>(null);
  const [targetDeleteDocTitle, setTargetDeleteDocTitle] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profRes, docsRes, pendingUpgradesRes, trainingReqsRes, templatesRes] = await Promise.all([
        collegeService.getCollegeProfile().catch(() => null),
        collegeService.getDocuments().catch(() => []),
        collegeService.getPendingStudentRequests().catch(() => []),
        trainingService.getCollegePendingRequests().catch(() => []),
        reportsService.getCollegeTemplates().catch(() => []),
      ]);

      setProfile(profRes);
      setDocuments(docsRes || []);
      setPendingStudentUpgrades(pendingUpgradesRes || []);
      setPendingTrainingRequests((trainingReqsRes || []).filter((r: any) => (r.status as any) === 1 || String(r.status).toLowerCase() === 'pending'));
      setTemplatesCount((templatesRes || []).length);
    } catch (err) {
      console.error('Failed to load college dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFile) {
      toast.error(t('college.documentTitle', 'Document title and file are required'));
      return;
    }
    try {
      setUploading(true);
      await collegeService.uploadCollegeDocument({ title: docTitle.trim(), file: docFile });
      toast.success(t('college.uploadBtn', 'College document uploaded successfully'));
      setDocTitle('');
      setDocFile(null);
      const fileInput = document.getElementById('college-doc-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchData();
    } catch (err: any) {
      console.error('Failed to upload document:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDeleteConfirm = (docId: number, title: string) => {
    setTargetDeleteDocId(docId);
    setTargetDeleteDocTitle(title);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteDocId) return;
    try {
      setDeleting(true);
      await collegeService.deleteCollegeDocument(targetDeleteDocId);
      toast.success(t('common.delete', 'Document removed successfully'));
      setDeleteConfirmOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Failed to delete document:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handlePreviewDocument = (docId: number, title: string) => {
    setViewingDocId(docId);
    setViewingTitle(title || 'College_Document');
    setViewerOpen(true);
  };

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const getFileExtension = (filePath?: string) => {
    if (!filePath) return 'PDF';
    return filePath.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const totalPendingAction = pendingStudentUpgrades.length + pendingTrainingRequests.length;

  const statCards = [
    {
      title: t('college.studentsSummary', 'Enrolled Students'),
      value: profile?.totalStudents ?? 0,
      description: t('admin.students', 'Active university students'),
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60',
      link: '/college/students',
    },
    {
      title: t('college.studentRegistrationsTab', 'Student Registrations'),
      value: pendingStudentUpgrades.length,
      description: t('common.pending', 'Awaiting verification'),
      icon: School,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60',
      link: '/college/requests',
      urgent: pendingStudentUpgrades.length > 0,
    },
    {
      title: t('college.trainingRequestsTab', 'Training Applications'),
      value: pendingTrainingRequests.length,
      description: t('dashboard.statInternshipsDesc', 'Pending acceptance checks'),
      icon: Briefcase,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
      link: '/college/requests',
      urgent: pendingTrainingRequests.length > 0,
    },
    {
      title: t('college.templatesTitle', 'Evaluation Templates'),
      value: templatesCount,
      description: t('college.activeTemplates', 'Published report forms'),
      icon: FileSpreadsheet,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
      link: '/college/templates',
    },
    {
      title: t('college.guidelinesSummary', 'Guideline Documents'),
      value: documents.length,
      description: t('college.statGuidelinesDesc', 'Training manuals uploaded'),
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
      link: '#guidelines',
    },
  ];

  const documentColumns: Column<CollegeDocumentDto>[] = [
    {
      header: '#',
      className: 'w-12 text-center text-xs text-slate-400',
      cell: (_, idx?: number) => (
        <span className="font-mono text-xs text-slate-400">
          {(idx ?? 0) + 1}
        </span>
      ),
    },
    {
      header: t('college.documentTitle', 'Document Title'),
      className: 'min-w-[220px]',
      cell: (doc) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</p>
            <p className="text-[10px] text-slate-400 font-mono line-clamp-1">ID: #{doc.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: t('college.format', 'Format'),
      className: 'w-24',
      cell: (doc) => {
        const ext = getFileExtension(doc.filePath);
        return (
          <Badge variant={ext === 'PDF' ? 'danger' : ext === 'DOC' || ext === 'DOCX' ? 'info' : 'neutral'} size="sm">
            {ext}
          </Badge>
        );
      },
    },
    {
      header: t('college.uploadedDate', 'Uploaded Date'),
      className: 'w-44 text-xs text-slate-500 dark:text-slate-400',
      cell: (doc) => (
        <div className="space-y-0.5">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
          </p>
          <p className="text-[10px] text-slate-400">
            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
      ),
    },
    {
      header: t('common.actions', 'Actions'),
      className: 'w-36 text-right',
      cell: (doc) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
            onClick={() => handlePreviewDocument(doc.id, doc.title)}
            title={t('college.previewDoc', 'Preview Document')}
          >
            {t('college.previewDoc', 'View')}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDeleteConfirm(doc.id, doc.title)}
            title={t('common.delete', 'Delete Document')}
            className="hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
            {t('college.dashboardTitle', 'College Administration Dashboard')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('college.dashboardSubtitle', 'Manage student enrollment, approve internship requests, and publish academic evaluation guidelines')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            {t('common.refresh', 'Refresh Data')}
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/college/requests')}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-md"
          >
            {t('college.requestsTitle', 'Review Requests')}
          </Button>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border border-indigo-500/20 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 backdrop-blur-md text-indigo-300 shrink-0 shadow-lg">
              <School className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {profile?.name || t('college.collegeHeroTitle', 'College Summer Training Administration')}
                </h2>
                <Badge variant="indigo" size="sm" className="bg-indigo-500/20 border-indigo-400/30 text-indigo-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {t('college.collegeRepBadge', 'College Representative')}
                </Badge>
              </div>
              <p className="text-xs text-indigo-200/80">
                <span>{profile?.address || profile?.city || 'Main Campus'}</span>
                <span className="mx-2">•</span>
                {totalPendingAction > 0 ? (
                  <span className="text-amber-300 font-medium">
                    {t('admin.requestsAwaitingReview', { count: totalPendingAction })}
                  </span>
                ) : (
                  <span className="text-indigo-300">{t('admin.allQueuesUpToDate', 'All student approval queues are up to date')}</span>
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
              onClick={() => navigate('/college/students')}
              leftIcon={<Users className="w-3.5 h-3.5" />}
            >
              {t('college.studentsTitle', 'Student Roster')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/college/templates')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {t('college.createTemplateBtn', '+ Create Template')}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              onClick={() => {
                if (card.link.startsWith('#')) {
                  const el = document.getElementById(card.link.substring(1));
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate(card.link);
                }
              }}
              className="p-3.5 cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{card.title}</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {card.value}
                      </p>
                      {card.urgent && (
                        <Badge variant="warning" size="sm" className="text-[10px] px-1.5 py-0">
                          {t('admin.actionRequired', 'Action Required')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl border ${card.color} group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-1">{card.description}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>{t('admin.manage', 'Manage')}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Hub: Pending Requests Summary */}
      {(pendingStudentUpgrades.length > 0 || pendingTrainingRequests.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending Student Upgrade Requests */}
          {pendingStudentUpgrades.length > 0 && (
            <Card
              className="border-sky-200/80 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20"
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300">
                    <School className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm font-bold">{t('college.studentRegistrationsTab', 'Student Registration Requests')}</h3>
                  </div>
                  <Badge variant="info" size="sm">
                    {t('admin.pendingCountBadge', { count: pendingStudentUpgrades.length })}
                  </Badge>
                </div>
              }
            >
              <div className="space-y-2.5">
                {pendingStudentUpgrades.slice(0, 3).map((upg) => (
                  <div
                    key={upg.publicId}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{upg.studentName}</p>
                      <p className="text-slate-400 truncate text-[11px]">
                        {upg.studentId ? `ID: ${upg.studentId}` : upg.collegeName}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/college/requests')}
                      rightIcon={<ArrowUpRight className="w-3 h-3" />}
                    >
                      {t('admin.review', 'Review')}
                    </Button>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sky-800 dark:text-sky-300 hover:bg-sky-100/60 mt-1"
                  onClick={() => navigate('/college/requests')}
                >
                  {t('admin.viewAllUpgradeRequests', { count: pendingStudentUpgrades.length })}
                </Button>
              </div>
            </Card>
          )}

          {/* Pending Summer Training Applications */}
          {pendingTrainingRequests.length > 0 && (
            <Card
              className="border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20"
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold">{t('college.trainingRequestsTab', 'Summer Training Applications')}</h3>
                  </div>
                  <Badge variant="warning" size="sm">
                    {t('admin.pendingCountBadge', { count: pendingTrainingRequests.length })}
                  </Badge>
                </div>
              }
            >
              <div className="space-y-2.5">
                {pendingTrainingRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{req.studentName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-400">{t('college.targetCompany', 'Company:')}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{req.companyName || '-'}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/college/requests')}
                      rightIcon={<ArrowUpRight className="w-3 h-3" />}
                    >
                      {t('admin.inspect', 'Inspect')}
                    </Button>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 mt-1"
                  onClick={() => navigate('/college/requests')}
                >
                  {t('admin.viewAllCompanyRequests', { count: pendingTrainingRequests.length })}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Main Grid: Upload Document Form & Guidelines Hub */}
      <div id="guidelines" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Academic Guideline Document */}
        <Card className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Upload className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('college.uploadGuidelineTitle', 'Upload Academic Guideline Document')}
            </h3>
          </div>

          <form onSubmit={handleUploadDocument} className="space-y-4">
            <Input
              label={t('college.documentTitle', 'Document Title *')}
              placeholder={t('college.documentTitlePlaceholder', 'e.g. Summer Training Guidelines & Syllabus 2026')}
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('college.selectFile', 'Select File (PDF, DOCX, IMG) *')}
              </label>
              <input
                id="college-doc-file-input"
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-indigo-400"
                required
              />
            </div>

            <p className="text-[11px] text-slate-400">
              {t('college.uploadGuidelineDesc', 'Uploaded guidelines are instantly accessible to all students enrolled in your college.')}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button type="submit" isLoading={uploading} size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                {t('college.uploadBtn', 'Upload Document')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Uploaded Documents Table */}
        <Card
          className="lg:col-span-2"
          header={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('college.documentsHubTitle', 'Uploaded College Documents & Guidelines')}
                </h3>
                <Badge variant="indigo" size="sm">
                  {documents.length}
                </Badge>
              </div>

              {documents.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('college.searchDocsPlaceholder', 'Search uploaded documents...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          }
        >
          <Table<CollegeDocumentDto>
            columns={documentColumns}
            data={filteredDocuments}
            keyExtractor={(doc) => doc.id}
            isLoading={loading}
            emptyMessage={
              searchQuery
                ? t('common.noData', 'No documents matching your search criteria.')
                : t('common.noData', 'No college guideline documents uploaded yet.')
            }
          />
        </Card>
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && viewingDocId && (
        <FileViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setViewingDocId(null);
          }}
          title={t('college.previewDoc', 'College Document Preview')}
          fileName={viewingTitle}
          fetchBlob={() => collegeService.downloadCollegeDocumentBlob(viewingDocId)}
        />
      )}

      {/* Delete Document Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('common.delete', 'Delete Document')}
        message={t('college.deleteDocConfirm', 'Are you sure you want to delete this document from the college guidelines list?')}
        confirmText={t('common.delete', 'Delete')}
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
};
