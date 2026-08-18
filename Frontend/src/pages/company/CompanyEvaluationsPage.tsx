import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
  Search,
  RefreshCw,
  FileText,
  User,
  School,
  Eye,
  Calendar,
} from 'lucide-react';
import { reportsService } from '../../api/reportsService';
import { CompanyStudentReportDto } from '../../types/reports';
import { enEvaluationScore } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { StudentReportAnswersViewer } from '../../components/dynamic-form/StudentReportAnswersViewer';

const parseScore = (val: any): enEvaluationScore => {
  if (!val) return enEvaluationScore.Excellent;
  const str = String(val).toLowerCase();
  if (str === '5' || str === 'excellent') return enEvaluationScore.Excellent;
  if (str === '4' || str === 'verygood') return enEvaluationScore.VeryGood;
  if (str === '3' || str === 'good') return enEvaluationScore.Good;
  if (str === '2' || str === 'fair') return enEvaluationScore.Fair;
  if (str === '1' || str === 'poor') return enEvaluationScore.Poor;
  return enEvaluationScore.Excellent;
};

const scoreGradeOptions: { value: enEvaluationScore; stars: number; label: string; desc: string }[] = [
  { value: enEvaluationScore.Excellent, stars: 5, label: '5 - Excellent', desc: 'ممتاز' },
  { value: enEvaluationScore.VeryGood, stars: 4, label: '4 - Very Good', desc: 'جيد جداً' },
  { value: enEvaluationScore.Good, stars: 3, label: '3 - Good', desc: 'جيد' },
  { value: enEvaluationScore.Fair, stars: 2, label: '2 - Fair', desc: 'مقبول' },
  { value: enEvaluationScore.Poor, stars: 1, label: '1 - Poor', desc: 'ضعيف' },
];

export const CompanyEvaluationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<CompanyStudentReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Evaluate Modal State
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CompanyStudentReportDto | null>(null);
  const [score, setScore] = useState<enEvaluationScore>(enEvaluationScore.Excellent);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // View Evaluation Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<CompanyStudentReportDto | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getCompanyReports();
      setReports(res || []);
    } catch (err) {
      console.error('Failed to fetch company reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenEvaluate = (report: CompanyStudentReportDto) => {
    setSelectedReport(report);
    setScore(parseScore(report.companyScore || report.evaluationScore));
    setFeedback(report.companyFeedback || report.evaluationComments || '');
    setEvalModalOpen(true);
  };

  const handleOpenDetails = (report: CompanyStudentReportDto) => {
    setViewingReport(report);
    setDetailsModalOpen(true);
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      setSubmitting(true);
      await reportsService.evaluateReport({
        studentReportPublicId: selectedReport.studentReportPublicId,
        score: score,
        comments: feedback.trim() || undefined,
        feedback: feedback.trim() || undefined,
      });
      toast.success('Trainee report evaluated successfully');
      setEvalModalOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // KPI Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(
      (r) => !r.companyScore && !r.evaluationScore
    ).length;
    const completed = total - pending;

    const scoresList = reports
      .map((r) => r.companyScore || r.evaluationScore)
      .filter((s): s is enEvaluationScore => s !== undefined && s !== null);

    const avgScore =
      scoresList.length > 0
        ? (scoresList.reduce((a, b) => a + Number(b), 0) / scoresList.length).toFixed(1)
        : null;

    return { total, pending, completed, avgScore };
  }, [reports]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const title = (r.templateTitle || r.reportTitle || '').toLowerCase();
      const student = (r.studentName || '').toLowerCase();
      const college = (r.collegeName || '').toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        title.includes(q) ||
        student.includes(q) ||
        college.includes(q);

      const isPending = !r.companyScore && !r.evaluationScore;
      let matchesStatus = true;
      if (statusFilter === 'pending') {
        matchesStatus = isPending;
      } else if (statusFilter === 'completed') {
        matchesStatus = !isPending;
      }

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  const renderScoreBadge = (scoreVal?: enEvaluationScore | number) => {
    if (!scoreVal) {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Pending Review</span>
        </Badge>
      );
    }

    const num = Number(scoreVal);
    const labelMap: Record<number, string> = {
      5: '5/5 Excellent',
      4: '4/5 Very Good',
      3: '3/5 Good',
      2: '2/5 Fair',
      1: '1/5 Poor',
    };

    return (
      <Badge variant="success" className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
        <span>{labelMap[num] || `${num}/5 Stars`}</span>
      </Badge>
    );
  };

  const columns: Column<CompanyStudentReportDto>[] = [
    {
      header: 'Trainee Student',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm shrink-0">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
              {item.studentName}
            </p>
            {item.collegeName && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <School className="w-3 h-3" />
                <span>{item.collegeName}</span>
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Report Title',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm hover:text-emerald-600 transition-colors">
            {item.templateTitle || item.reportTitle || 'Summer Training Report'}
          </p>
          {(item.submittedAt || item.submissionDate) && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>
                Submitted: {new Date((item.submittedAt || item.submissionDate)!).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Company Evaluation',
      cell: (item) => renderScoreBadge(item.companyScore || item.evaluationScore),
    },
    {
      header: 'Reviewer Remarks',
      cell: (item) => {
        const comments = item.companyFeedback || item.evaluationComments;
        if (!comments) {
          return <span className="text-xs text-slate-400 italic">No notes recorded</span>;
        }
        return (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic max-w-xs">
            "{comments}"
          </p>
        );
      },
    },
    {
      header: t('common.actions'),
      cell: (item) => {
        const isEvaluated = Boolean(item.companyScore || item.evaluationScore);
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant={isEvaluated ? 'outline' : 'primary'}
              size="sm"
              onClick={() => handleOpenEvaluate(item)}
              leftIcon={<Star className="w-3.5 h-3.5" />}
              className={!isEvaluated ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : ''}
            >
              {isEvaluated ? 'Edit Evaluation' : 'Review & Evaluate'}
            </Button>

            {isEvaluated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDetails(item)}
                title="View Evaluation Summary"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('nav.reportSubmissions', 'Trainee Report Evaluations')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review student periodic reports, submit supervisor ratings, and record written feedback for universities
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchReports}
          isLoading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-emerald-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submissions</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">reports received</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-amber-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Awaiting Evaluation</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</span>
            <span className="text-xs text-amber-600 font-medium">needs action</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-teal-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-teal-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Evaluated Reports</span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</span>
            <span className="text-xs text-teal-600 font-medium">graded</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Rating</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.avgScore ? `${stats.avgScore}/5` : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">overall score</span>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by trainee name, college, or report title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Awaiting Review ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Evaluated ({stats.completed})
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <Table
        columns={columns}
        data={filteredReports}
        keyExtractor={(item) => item.studentReportPublicId}
        isLoading={loading}
        emptyMessage={
          searchQuery
            ? 'No matching report submissions found.'
            : 'No trainee report submissions recorded yet.'
        }
      />

      {/* MODAL 1: Evaluate Trainee Report Modal */}
      <Modal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        title="Review Answers & Evaluate Trainee Report"
        maxWidth="2xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Student Answers Inspection */}
            <div className="p-1">
              <StudentReportAnswersViewer
                studentReportPublicId={selectedReport.studentReportPublicId}
                showDeleteButton={false}
              />
            </div>

            {/* Evaluation Form */}
            <form onSubmit={handleEvaluateSubmit} className="space-y-4 pt-4 border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <span>Company Performance Evaluation</span>
                </h4>
                <Badge variant="indigo" size="sm">
                  {selectedReport.studentName}
                </Badge>
              </div>

              {/* Score Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Evaluation Rating Score *
                  </label>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Selected: {scoreGradeOptions.find(o => o.value === score)?.label || score}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {scoreGradeOptions.map((opt) => {
                    const isSelected = score === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setScore(opt.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-500 shadow-xs ring-2 ring-amber-400/50'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-0.5 text-amber-500 mb-1">
                          {Array.from({ length: opt.stars }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-900 dark:text-amber-200' : 'text-slate-700 dark:text-slate-300'}`}>
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Supervisor Feedback & Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter specific performance observations, praise, or areas for improvement..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Written remarks will be shared with the trainee and their university academic supervisor.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button variant="ghost" onClick={() => setEvalModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Submit Evaluation
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* MODAL 2: View Evaluation Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Supervisor Evaluation Details"
        maxWidth="md"
      >
        {viewingReport && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {viewingReport.templateTitle || viewingReport.reportTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trainee: <strong className="text-slate-800 dark:text-slate-200">{viewingReport.studentName}</strong>
              </p>
              {viewingReport.collegeName && (
                <p className="text-xs text-slate-400">College: {viewingReport.collegeName}</p>
              )}
            </div>

            {/* Score Display Card */}
            <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
                  <span>Company Performance Score</span>
                </span>
                {renderScoreBadge(viewingReport.companyScore || viewingReport.evaluationScore)}
              </div>

              {(viewingReport.companyFeedback || viewingReport.evaluationComments) ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/60 mt-2">
                  "{viewingReport.companyFeedback || viewingReport.evaluationComments}"
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No written comments provided.</p>
              )}

              {viewingReport.evaluatedAt && (
                <p className="text-[10px] text-slate-400 pt-1">
                  Evaluated on: {new Date(viewingReport.evaluatedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
