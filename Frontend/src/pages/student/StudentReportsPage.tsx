import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  FileText,
  FilePlus,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Award,
  Building2,
  GraduationCap,
  RefreshCw,
  Eye,
  ChevronRight,
  Info,
} from 'lucide-react';
import { reportsService } from '../../api/reportsService';
import { StudentReportSummaryDto, TemplateDetailsDto } from '../../types/reports';
import { enReportStatus } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { DynamicReportFormRunner } from '../../components/dynamic-form/DynamicReportFormRunner';

export const StudentReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<StudentReportSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'draft' | 'pending' | 'completed'>('all');

  // Modals State
  const [activeTemplate, setActiveTemplate] = useState<TemplateDetailsDto | null>(null);
  const [fillModalOpen, setFillModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedReportFeedback, setSelectedReportFeedback] = useState<StudentReportSummaryDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getMyReports();
      setReports(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenFill = async (templatePublicId: string) => {
    try {
      setLoadingTemplate(true);
      const details = await reportsService.getTemplateDetails(templatePublicId);
      setActiveTemplate(details);
      setFillModalOpen(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to open report questionnaire.');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleSubmitForm = async (answers: any[]) => {
    if (!activeTemplate) return;
    try {
      setSubmitting(true);
      await reportsService.submitReport({
        templatePublicId: activeTemplate.templatePublicId,
        answers,
      });
      toast.success('Report submitted successfully!');
      setFillModalOpen(false);
      setActiveTemplate(null);
      fetchReports();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.devMessage || err.response?.data?.message || 'Failed to submit report.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenFeedback = (report: StudentReportSummaryDto) => {
    setSelectedReportFeedback(report);
    setFeedbackModalOpen(true);
  };

  // KPI Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const drafts = reports.filter((r) => r.status === enReportStatus.Draft).length;
    const inReview = reports.filter(
      (r) =>
        r.status === enReportStatus.PendingCompanyReview ||
        r.status === enReportStatus.PendingCollegeReview
    ).length;
    const completed = reports.filter((r) => r.status === enReportStatus.Completed).length;

    return { total, drafts, inReview, completed };
  }, [reports]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Search
      const matchesSearch =
        item.templateTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Tab filter
      let matchesTab = true;
      if (statusTab === 'draft') {
        matchesTab = item.status === enReportStatus.Draft;
      } else if (statusTab === 'pending') {
        matchesTab =
          item.status === enReportStatus.PendingCompanyReview ||
          item.status === enReportStatus.PendingCollegeReview;
      } else if (statusTab === 'completed') {
        matchesTab = item.status === enReportStatus.Completed;
      }

      return matchesSearch && matchesTab;
    });
  }, [reports, searchTerm, statusTab]);

  // Helper for Due Date rendering
  const renderDueDateBadge = (dueDateStr?: string, status?: enReportStatus) => {
    if (!dueDateStr) return <span className="text-xs text-slate-400">No deadline</span>;

    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === enReportStatus.Completed) {
      return (
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Submitted</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{due.toLocaleDateString()}</p>
        </div>
      );
    }

    if (diffDays < 0) {
      return (
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
            <Clock className="w-3 h-3" />
            <span>Passed Due</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{due.toLocaleDateString()}</p>
        </div>
      );
    }

    if (diffDays <= 3) {
      return (
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
            <Clock className="w-3 h-3" />
            <span>Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{due.toLocaleDateString()}</p>
        </div>
      );
    }

    return (
      <div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900">
          <Calendar className="w-3 h-3" />
          <span>Due in {diffDays} days</span>
        </span>
        <p className="text-[11px] text-slate-400 mt-0.5">{due.toLocaleDateString()}</p>
      </div>
    );
  };

  const columns: Column<StudentReportSummaryDto>[] = [
    {
      header: 'Report Title & Details',
      cell: (item) => (
        <div className="max-w-xs sm:max-w-sm space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white text-sm hover:text-indigo-600 transition-colors">
            {item.templateTitle}
          </p>
          {item.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {item.description}
            </p>
          )}
          <p className="text-[11px] text-slate-400">
            {item.submittedAt
              ? `Submitted: ${new Date(item.submittedAt).toLocaleDateString()}`
              : `Questions: ${item.questionsCount ?? 'Multiple'}`}
          </p>
        </div>
      ),
    },
    {
      header: 'Deadline / Due Date',
      cell: (item) => renderDueDateBadge(item.dueDate, item.status),
    },
    {
      header: 'Status',
      cell: (item) => {
        const variantMap = {
          [enReportStatus.Draft]: 'neutral' as const,
          [enReportStatus.PendingCompanyReview]: 'warning' as const,
          [enReportStatus.PendingCollegeReview]: 'info' as const,
          [enReportStatus.Completed]: 'success' as const,
          [enReportStatus.Rejected]: 'danger' as const,
        };
        const labelMap = {
          [enReportStatus.Draft]: 'Pending Submission',
          [enReportStatus.PendingCompanyReview]: 'Under Company Review',
          [enReportStatus.PendingCollegeReview]: 'Under College Review',
          [enReportStatus.Completed]: 'Completed & Evaluated',
          [enReportStatus.Rejected]: 'Needs Revision',
        };
        return <Badge variant={variantMap[item.status]}>{labelMap[item.status]}</Badge>;
      },
    },
    {
      header: 'Evaluations & Scores',
      cell: (item) => {
        const hasScores = item.companyScore || item.collegeScore || item.companyFeedback || item.collegeFeedback;

        return (
          <div className="space-y-1 text-xs">
            {item.companyScore && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company: {item.companyScore}</span>
              </div>
            )}
            {item.collegeScore && (
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>College: {item.collegeScore}</span>
              </div>
            )}
            {!item.companyScore && !item.collegeScore && (
              <span className="text-slate-400 text-xs">
                {item.status === enReportStatus.Draft ? 'Not Submitted' : 'Awaiting Review'}
              </span>
            )}

            {hasScores && (
              <button
                type="button"
                onClick={() => handleOpenFeedback(item)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pt-0.5"
              >
                <MessageSquare className="w-3 h-3" />
                <span>View Feedback</span>
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: t('common.actions'),
      cell: (item) =>
        item.status === enReportStatus.Draft ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenFill(item.templatePublicId)}
            leftIcon={<FilePlus className="w-3.5 h-3.5" />}
          >
            Fill Report
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenFill(item.templatePublicId)}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              View Form
            </Button>
            {(item.companyFeedback || item.collegeFeedback || item.companyScore || item.collegeScore) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenFeedback(item)}
                title="View Supervisor Feedback"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </Button>
            )}
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('nav.reportsHub')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill required periodic evaluation forms, submit weekly logs, and track supervisor feedback & ratings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchReports}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Assigned</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">reports required</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-amber-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending to Fill</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <FilePlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.drafts}</span>
            <span className="text-xs text-amber-600 font-medium">action required</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-sky-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-sky-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Under Review</span>
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inReview}</span>
            <span className="text-xs text-sky-600 font-medium">with supervisors</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-emerald-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed & Evaluated</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</span>
            <span className="text-xs text-emerald-600 font-medium">evaluated</span>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search report forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({reports.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('draft')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusTab === 'draft'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            To Fill ({stats.drafts})
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusTab === 'pending'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            In Review ({stats.inReview})
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusTab === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <Table
        columns={columns}
        data={filteredReports}
        keyExtractor={(item) => item.studentReportPublicId || item.templatePublicId}
        isLoading={loading}
        emptyMessage="No reports match your current filter."
      />

      {/* MODAL 1: Fill / View Form Modal */}
      <Modal
        isOpen={fillModalOpen}
        onClose={() => {
          setFillModalOpen(false);
          setActiveTemplate(null);
        }}
        title={activeTemplate ? activeTemplate.title : 'Report Submission Form'}
        maxWidth="xl"
      >
        {activeTemplate && (
          <DynamicReportFormRunner
            template={activeTemplate}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              setFillModalOpen(false);
              setActiveTemplate(null);
            }}
            isLoading={submitting}
          />
        )}
      </Modal>

      {/* MODAL 2: View Supervisor Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setSelectedReportFeedback(null);
        }}
        title="Supervisor Evaluation & Feedback"
        maxWidth="md"
      >
        {selectedReportFeedback && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedReportFeedback.templateTitle}
              </h3>
              {selectedReportFeedback.submittedAt && (
                <p className="text-xs text-slate-400">
                  Submitted on: {new Date(selectedReportFeedback.submittedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Company Evaluation */}
            <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/40 dark:bg-blue-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Company Supervisor Evaluation</span>
                </span>
                {selectedReportFeedback.companyScore ? (
                  <Badge variant="indigo" size="sm">
                    {selectedReportFeedback.companyScore}
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-400">Not evaluated yet</span>
                )}
              </div>

              {selectedReportFeedback.companyFeedback ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-blue-200/60 dark:border-blue-900/60">
                  "{selectedReportFeedback.companyFeedback}"
                </p>
              ) : (
                <p className="text-xs text-slate-400">No written comments provided.</p>
              )}
            </div>

            {/* College Evaluation */}
            <div className="p-4 rounded-xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/40 dark:bg-purple-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>College Supervisor Evaluation</span>
                </span>
                {selectedReportFeedback.collegeScore ? (
                  <Badge variant="indigo" size="sm">
                    {selectedReportFeedback.collegeScore}
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-400">Not evaluated yet</span>
                )}
              </div>

              {selectedReportFeedback.collegeFeedback ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-purple-200/60 dark:border-purple-900/60">
                  "{selectedReportFeedback.collegeFeedback}"
                </p>
              ) : (
                <p className="text-xs text-slate-400">No written comments provided.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => {
                  setFeedbackModalOpen(false);
                  setSelectedReportFeedback(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
