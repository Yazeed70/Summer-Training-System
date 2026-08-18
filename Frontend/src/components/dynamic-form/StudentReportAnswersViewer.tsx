import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  Clock,
  Star,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Trash2,
  User,
  Paperclip,
  Check,
  X,
  HelpCircle,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { reportsService } from '../../api/reportsService';
import { StudentReportDetailsDto, ReportAnswerDetailDto } from '../../types/reports';
import { enQuestionType, enReportStatus } from '../../types/enums';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FileViewerModal } from '../ui/FileViewerModal';

interface StudentReportAnswersViewerProps {
  studentReportPublicId: string;
  onDeleteSubmission?: () => void;
  showDeleteButton?: boolean;
  onClose?: () => void;
}

export const StudentReportAnswersViewer: React.FC<StudentReportAnswersViewerProps> = ({
  studentReportPublicId,
  onDeleteSubmission,
  showDeleteButton = false,
  onClose,
}) => {
  const [details, setDetails] = useState<StudentReportDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // File Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ filePath: string; fileName: string } | null>(null);

  const handleOpenPreview = (filePath: string, fileName: string) => {
    setPreviewFile({ filePath, fileName });
    setPreviewModalOpen(true);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await reportsService.getStudentReportDetails(studentReportPublicId);
        setDetails(data);
      } catch (err: any) {
        console.error('Failed to load report submission details:', err);
        toast.error('Failed to load report submission details.');
      } finally {
        setLoading(false);
      }
    };

    if (studentReportPublicId) {
      fetchDetails();
    }
  }, [studentReportPublicId]);

  const handleDownloadAttachment = async (filePath: string) => {
    try {
      setDownloadingFile(filePath);
      const blob = await reportsService.downloadAttachmentBlob(filePath);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = filePath.split('/').pop()?.split('\\').pop() || 'report-attachment';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download attachment:', err);
      toast.error('Failed to download attached file.');
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await reportsService.deleteStudentReport(studentReportPublicId);
      toast.success('Report submission deleted successfully. You can now fill and submit the report again.');
      if (onDeleteSubmission) {
        onDeleteSubmission();
      }
    } catch (err: any) {
      console.error('Failed to delete report submission:', err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading submitted questions & answers...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="py-8 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Submission details not found</p>
        <p className="text-xs text-slate-400">The requested report submission could not be loaded.</p>
      </div>
    );
  }

  const renderAnswerValue = (q: ReportAnswerDetailDto) => {
    const val = q.answerValue || (q as any).AnswerValue || '';
    const attachment = q.attachmentPath || (q as any).AttachmentPath || '';
    const qType = String(q.questionType || (q as any).QuestionType || '').toLowerCase();

    if (!val && !attachment) {
      return (
        <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 italic">
          No answer provided by trainee
        </div>
      );
    }

    // Text type
    if (qType === 'text' || qType === '1') {
      return (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed shadow-xs font-medium">
          {val}
        </div>
      );
    }

    // Multiple Choice or Dropdown
    if (qType === 'multiplechoice' || qType === '2' || qType === 'dropdown' || qType === '4' || qType === 'checkbox' || qType === '3') {
      return (
        <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-xs">
            <Check className="w-3.5 h-3.5" />
            <span>{val}</span>
          </span>
        </div>
      );
    }

    // Rating Scale
    if (qType === 'ratingscale' || qType === '5') {
      const ratingNum = Number(val);
      const ratingLabelMap: Record<number, string> = {
        5: '5/5 Excellent',
        4: '4/5 Very Good',
        3: '3/5 Good',
        2: '2/5 Fair',
        1: '1/5 Poor',
      };

      return (
        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((score) => (
              <div
                key={score}
                className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  score <= ratingNum
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <Star className={`w-4 h-4 ${score <= ratingNum ? 'fill-white' : ''}`} />
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
            {ratingLabelMap[ratingNum] || `${ratingNum}/5 Stars`}
          </span>
        </div>
      );
    }

    // Boolean
    if (qType === 'boolean' || qType === '9') {
      const isYes = val.toLowerCase() === 'yes' || val.toLowerCase() === 'true';
      return (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
              isYes
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-600 text-white shadow-xs'
            }`}
          >
            {isYes ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{val}</span>
          </span>
        </div>
      );
    }

    // Date
    if (qType === 'date' || qType === '6') {
      return (
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>{val}</span>
        </div>
      );
    }

    // Time
    if (qType === 'time' || qType === '7') {
      return (
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>{val}</span>
        </div>
      );
    }

    // File Upload
    if (qType === 'fileupload' || qType === '8' || attachment) {
      const filePath = attachment || val;
      const fileName = filePath.split('/').pop()?.split('\\').pop() || 'Attachment';
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/50 dark:bg-indigo-950/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Paperclip className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{fileName}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Uploaded report document / proof</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleOpenPreview(filePath, fileName)}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              View Document
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadAttachment(filePath)}
              isLoading={downloadingFile === filePath}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs font-semibold bg-white dark:bg-slate-900 shadow-xs"
              title="Download File Directly"
            >
              Download
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
        {val}
      </div>
    );
  };

  const statusVariantMap = {
    [enReportStatus.Draft]: 'neutral' as const,
    [enReportStatus.PendingCompanyReview]: 'warning' as const,
    [enReportStatus.PendingCollegeReview]: 'info' as const,
    [enReportStatus.Completed]: 'success' as const,
    [enReportStatus.Rejected]: 'danger' as const,
  };

  const statusLabelMap = {
    [enReportStatus.Draft]: 'Pending Submission',
    [enReportStatus.PendingCompanyReview]: 'Under Company Review',
    [enReportStatus.PendingCollegeReview]: 'Under College Review',
    [enReportStatus.Completed]: 'Completed & Evaluated',
    [enReportStatus.Rejected]: 'Needs Revision',
  };

  const answersList = details.answers || (details as any).Answers || [];

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {details.templateTitle || (details as any).TemplateTitle}
              </h3>
            </div>
            {(details.templateDescription || (details as any).TemplateDescription) && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {details.templateDescription || (details as any).TemplateDescription}
              </p>
            )}
          </div>
          <Badge variant={statusVariantMap[details.status]}>
            {statusLabelMap[details.status]}
          </Badge>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 text-xs">
          {details.studentName && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Student: <strong className="text-slate-900 dark:text-white">{details.studentName}</strong></span>
            </div>
          )}

          {details.submissionDate && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Submitted: {new Date(details.submissionDate).toLocaleDateString()}</span>
            </div>
          )}

          {details.companyName && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Company: {details.companyName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Evaluations Summary Banner if already evaluated */}
      {(details.companyScore || details.collegeScore) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {details.companyScore && (
            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Company Evaluation Score: {details.companyScore}/5</span>
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                  {details.companyEvaluatorName ? `By ${details.companyEvaluatorName}` : ''}
                </span>
              </div>
              {details.companyFeedback && (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
                  "{details.companyFeedback}"
                </p>
              )}
            </div>
          )}

          {details.collegeScore && (
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>College Academic Score: {details.collegeScore}/5</span>
                </span>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-300">
                  {details.collegeEvaluatorName ? `By ${details.collegeEvaluatorName}` : ''}
                </span>
              </div>
              {details.collegeFeedback && (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-indigo-200/50 dark:border-indigo-900/50">
                  "{details.collegeFeedback}"
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Questions and Answers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Questionnaire & Student Answers ({answersList.length} Questions)
            </h4>
          </div>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            Review Mode
          </span>
        </div>

        <div className="space-y-4">
          {answersList.map((q: ReportAnswerDetailDto, idx: number) => {
            const qText = q.questionText || (q as any).QuestionText || `Question ${idx + 1}`;
            const isReq = q.isRequired ?? (q as any).IsRequired ?? false;

            return (
              <div
                key={q.questionId || (q as any).QuestionId || idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 transition-all hover:border-indigo-200 dark:hover:border-slate-700"
              >
                {/* Question Header & Prompt */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                      Q{idx + 1}
                    </span>
                    {isReq && (
                      <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
                        Required
                      </span>
                    )}
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-snug pt-1">
                    {qText}
                  </h5>
                </div>

                {/* Answer Display */}
                <div className="pt-1">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    <span>Student Answer:</span>
                  </p>
                  {renderAnswerValue(q)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete / Withdraw Confirmation Box (for student when canDelete is true) */}
      {confirmDelete && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Are you sure you want to delete this submission?
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                This will delete your submitted answers and revert the template to "To Fill" so you can submit fresh answers.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Confirm Delete & Re-submit
            </Button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          {showDeleteButton && details.canDelete && !confirmDelete && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Submission & Re-fill
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {previewFile && (
        <FileViewerModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewFile(null);
          }}
          title={`Document Viewer: ${previewFile.fileName}`}
          fileName={previewFile.fileName}
          fetchBlob={() => reportsService.downloadAttachmentBlob(previewFile.filePath)}
        />
      )}
    </div>
  );
};
