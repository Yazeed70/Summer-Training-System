import React, { useState } from 'react';
import { toast } from 'sonner';
import { Star, Upload, FileCheck, Calendar, Clock, CheckSquare } from 'lucide-react';
import { TemplateDetailsDto, StudentAnswerDto } from '../../types/reports';
import { enQuestionType } from '../../types/enums';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { reportsService } from '../../api/reportsService';

interface DynamicReportFormRunnerProps {
  template: TemplateDetailsDto;
  onSubmit: (answers: StudentAnswerDto[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DynamicReportFormRunner: React.FC<DynamicReportFormRunnerProps> = ({
  template,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [answers, setAnswers] = useState<Record<number, { answerValue?: string; attachmentPath?: string }>>({});
  const [uploadingQuestionId, setUploadingQuestionId] = useState<number | null>(null);

  const updateAnswerValue = (qId: number, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], answerValue: val },
    }));
  };

  const handleFileUpload = async (qId: number, file: File) => {
    try {
      setUploadingQuestionId(qId);
      const res = await reportsService.uploadReportAttachment(file);
      setAnswers((prev) => ({
        ...prev,
        [qId]: { ...prev[qId], attachmentPath: res.filePath, answerValue: res.filePath },
      }));
      toast.success('File uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file attachment');
    } finally {
      setUploadingQuestionId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required questions
    for (const q of template.questions) {
      if (q.isRequired) {
        const ans = answers[q.id];
        const val = ans?.answerValue?.trim() || ans?.attachmentPath?.trim();
        if (!val) {
          toast.error(`Question "${q.questionText}" is required.`);
          return;
        }
      }
    }

    const payload: StudentAnswerDto[] = template.questions.map((q) => {
      const data = answers[q.id];
      const val = data?.answerValue ?? data?.attachmentPath ?? '';
      return {
        questionId: q.id,
        answerValue: val,
        attachmentPath: data?.attachmentPath,
      };
    });

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{template.title}</h2>
        {template.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{template.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {template.questions.map((q, idx) => {
          const currentAns = answers[q.id]?.answerValue || '';

          return (
            <div key={q.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {idx + 1}. {q.questionText}
                  {q.isRequired && <span className="text-rose-500 ml-1">*</span>}
                </label>
              </div>

              {/* Render Question Input by Type */}
              {q.questionType === enQuestionType.Text && (
                <textarea
                  rows={3}
                  value={currentAns}
                  onChange={(e) => updateAnswerValue(q.id, e.target.value)}
                  placeholder="Enter your response..."
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}

              {q.questionType === enQuestionType.MultipleChoice && (
                <div className="space-y-2">
                  {(q.options || []).map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt}
                        checked={currentAns === opt}
                        onChange={() => updateAnswerValue(q.id, opt)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.questionType === enQuestionType.Dropdown && (
                <Select
                  value={currentAns}
                  onChange={(e) => updateAnswerValue(q.id, e.target.value)}
                  placeholder="Select option"
                  options={(q.options || []).map((opt) => ({ value: opt, label: opt }))}
                />
              )}

              {q.questionType === enQuestionType.RatingScale && (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => updateAnswerValue(q.id, String(score))}
                      className={`p-2 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all ${
                        currentAns === String(score)
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      <span>{score}</span>
                    </button>
                  ))}
                </div>
              )}

              {q.questionType === enQuestionType.Boolean && (
                <div className="flex items-center gap-3">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateAnswerValue(q.id, opt)}
                      className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                        currentAns === opt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.questionType === enQuestionType.Date && (
                <Input
                  type="date"
                  value={currentAns}
                  onChange={(e) => updateAnswerValue(q.id, e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                />
              )}

              {q.questionType === enQuestionType.Time && (
                <Input
                  type="time"
                  value={currentAns}
                  onChange={(e) => updateAnswerValue(q.id, e.target.value)}
                  leftIcon={<Clock className="w-4 h-4" />}
                />
              )}

              {q.questionType === enQuestionType.FileUpload && (
                <div className="space-y-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(q.id, file);
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-indigo-400"
                  />
                  {answers[q.id]?.attachmentPath && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ File attached: {answers[q.id]?.attachmentPath}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Submit Report
        </Button>
      </div>
    </form>
  );
};
