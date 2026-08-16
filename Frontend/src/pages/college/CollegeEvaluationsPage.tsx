import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { reportsService } from '../../api/reportsService';
import { CollegeStudentReportDto } from '../../types/reports';
import { enEvaluationScore, enReportStatus } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

export const CollegeEvaluationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<CollegeStudentReportDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [score, setScore] = useState<enEvaluationScore>(enEvaluationScore.Excellent);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getCollegeStudentReports();
      setReports(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenEvaluate = (publicId: string) => {
    setSelectedReportId(publicId);
    setScore(enEvaluationScore.Excellent);
    setFeedback('');
    setEvalModalOpen(true);
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await reportsService.evaluateReport({
        studentReportPublicId: selectedReportId,
        score: score,
        feedback: feedback || undefined,
      });
      toast.success('Report evaluated successfully');
      setEvalModalOpen(false);
      fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<CollegeStudentReportDto>[] = [
    {
      header: 'Student Name',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.studentName}</p>
          <p className="text-xs text-slate-400">ID: {item.studentId || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Report Title',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.templateTitle}</p>
          <p className="text-xs text-slate-400">Company: {item.companyName || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Evaluation Scores',
      cell: (item) => (
        <div className="space-y-1 text-xs">
          {item.companyScore && (
            <p className="text-emerald-600 font-semibold">Company: {item.companyScore}/5</p>
          )}
          {item.collegeScore ? (
            <p className="text-indigo-600 font-semibold">College: {item.collegeScore}/5</p>
          ) : (
            <Badge variant="warning">College Evaluation Pending</Badge>
          )}
        </div>
      ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenEvaluate(item.studentReportPublicId)}
          leftIcon={<Star className="w-3.5 h-3.5" />}
        >
          Evaluate
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.reportSubmissions')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review student report submissions and record college evaluation grades
          </p>
        </div>
      </div>

      <Table columns={columns} data={reports} keyExtractor={(item) => item.studentReportPublicId} isLoading={loading} emptyMessage="No student report submissions." />

      <Modal isOpen={evalModalOpen} onClose={() => setEvalModalOpen(false)} title="Evaluate Student Report">
        <form onSubmit={handleEvaluateSubmit} className="space-y-4">
          <Select
            label="Evaluation Score Grade"
            value={score}
            onChange={(e) => setScore(e.target.value as enEvaluationScore)}
            options={[
              { value: enEvaluationScore.Excellent, label: '5 - Excellent' },
              { value: enEvaluationScore.VeryGood, label: '4 - Very Good' },
              { value: enEvaluationScore.Good, label: '3 - Good' },
              { value: enEvaluationScore.Fair, label: '2 - Fair' },
              { value: enEvaluationScore.Poor, label: '1 - Poor' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Academic Supervisor Feedback
            </label>
            <textarea
              rows={3}
              placeholder="Enter feedback comments for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setEvalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Submit Evaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
