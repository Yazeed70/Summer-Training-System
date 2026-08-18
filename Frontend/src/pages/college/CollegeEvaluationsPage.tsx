import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Star,
  CheckCircle,
  FileSpreadsheet,
  Search,
  RefreshCw,
  Building2,
  GraduationCap,
  Award,
  Clock,
  Eye,
} from 'lucide-react';
import { reportsService } from '../../api/reportsService';
import { CollegeStudentReportDto } from '../../types/reports';
import { enEvaluationScore } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
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

export const CollegeEvaluationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<CollegeStudentReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CollegeStudentReportDto | null>(null);
  const [score, setScore] = useState<enEvaluationScore>(enEvaluationScore.Excellent);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getCollegeStudentReports();
      setReports(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenEvaluate = (report: CollegeStudentReportDto) => {
    setSelectedReport(report);
    setScore(parseScore(report.collegeScore || report.evaluationScore));
    setFeedback(report.collegeFeedback || report.evaluationComments || '');
    setEvalModalOpen(true);
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      setSubmitting(true);
      await reportsService.evaluateReport({
        studentReportPublicId: selectedReport.studentReportPublicId,
        score: score,
        feedback: feedback.trim() || undefined,
      });
      toast.success(t('college.submitEvaluationBtn', 'Report evaluated successfully'));
      setEvalModalOpen(false);
      fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.templateTitle && r.templateTitle.toLowerCase().includes(q)) ||
        (r.companyName && r.companyName.toLowerCase().includes(q))
    );
  }, [reports, searchQuery]);

  const stats = useMemo(() => {
    const total = reports.length;
    const evaluated = reports.filter((r) => r.collegeScore !== null && r.collegeScore !== undefined).length;
    const pending = total - evaluated;
    return { total, evaluated, pending };
  }, [reports]);

  const columns: Column<CollegeStudentReportDto>[] = [
    {
      header: t('college.studentName', 'Student Name'),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs shrink-0">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight">{item.studentName}</p>
            <p className="text-[11px] text-slate-400 font-mono">ID: {item.studentId || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      header: t('college.templatesTitle', 'Report Title'),
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.templateTitle}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{item.companyName || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('college.evaluationsTitle', 'Evaluation Scores'),
      cell: (item) => (
        <div className="space-y-1 text-xs">
          {item.companyScore ? (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Company: {item.companyScore}/5</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Company pending</span>
          )}
          {item.collegeScore ? (
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
              <span>College Grade: {item.collegeScore}/5</span>
            </div>
          ) : (
            <Badge variant="warning">{t('common.pending', 'College Evaluation Pending')}</Badge>
          )}
        </div>
      ),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <Button
          variant={item.collegeScore ? 'outline' : 'primary'}
          size="sm"
          onClick={() => handleOpenEvaluate(item)}
          leftIcon={<Star className="w-3.5 h-3.5" />}
          className={!item.collegeScore ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' : ''}
        >
          {item.collegeScore ? t('college.evaluateBtn', 'Update Grade') : t('college.evaluateBtn', 'Review & Evaluate')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('college.evaluationsTitle', 'Student Reports & Progress Evaluations')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('college.evaluationsSubtitle', 'Review submitted periodic reports and submit formal college evaluation grades')}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchReports}
          isLoading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          {t('common.refresh', 'Refresh')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submissions</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">reports submitted</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-emerald-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Evaluated by College</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.evaluated}</span>
            <span className="text-xs text-emerald-600 font-medium">grades recorded</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-amber-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Evaluation</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</span>
            <span className="text-xs text-amber-600 font-medium">awaiting grade</span>
          </div>
        </Card>
      </div>

      {/* Search Toolbar */}
      <div className="w-full sm:w-80">
        <Input
          placeholder="Search by student name, company, or report..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Reports Table */}
      <Table
        columns={columns}
        data={filteredReports}
        keyExtractor={(item) => item.studentReportPublicId}
        isLoading={loading}
        emptyMessage={
          searchQuery
            ? t('common.noData', 'No matching student reports found.')
            : t('common.noData', 'No student report submissions available.')
        }
      />

      {/* Evaluate Report Modal */}
      <Modal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        title={t('college.evaluateModalTitle', 'Review Answers & Evaluate Student Report')}
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
                  <Star className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                  <span>College Academic Evaluation</span>
                </h4>
                <Badge variant="indigo" size="sm">
                  {selectedReport.studentName}
                </Badge>
              </div>

              {/* Interactive Score Grade Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('college.scoreGradeLabel', 'Evaluation Score Grade *')}
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 shadow-xs ring-2 ring-indigo-500/50'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-0.5 text-amber-500 mb-1">
                          {Array.from({ length: opt.stars }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>
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

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('college.feedbackLabel', 'Academic Supervisor Feedback')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('college.feedbackPlaceholder', 'Enter supervisor notes and feedback for the trainee...')}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button variant="ghost" onClick={() => setEvalModalOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {t('college.submitEvaluationBtn', 'Submit Evaluation')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
