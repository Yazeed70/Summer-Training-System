import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Save,
  Calendar,
  Building2,
  GraduationCap,
  Users2,
  FileCheck2,
  Copy,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { CreateQuestionDto, SaveTemplateDto, TemplateDetailsDto } from '../../types/reports';
import { enEvaluationPhase, enQuestionType } from '../../types/enums';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';

interface ReportTemplateBuilderProps {
  initialData?: TemplateDetailsDto | null;
  initialPhase?: enEvaluationPhase;
  onSave: (dto: SaveTemplateDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

type EvaluatorMode = 'college_only' | 'company_only' | 'both' | 'none';

export const ReportTemplateBuilder: React.FC<ReportTemplateBuilderProps> = ({
  initialData,
  initialPhase = enEvaluationPhase.CollegeEvaluation,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isAvailable, setIsAvailable] = useState<boolean>(initialData?.isAvailable ?? true);

  // Due Date (defaults to 7 days from now formatted for date input)
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState<string>(() => {
    if (initialData?.dueDate) {
      try {
        return new Date(initialData.dueDate).toISOString().split('T')[0];
      } catch {
        return defaultDueDate();
      }
    }
    return defaultDueDate();
  });

  // Evaluator Mode determination
  const determineEvaluatorMode = (): EvaluatorMode => {
    if (initialData) {
      const col = initialData.requiresCollegeEvaluation;
      const comp = initialData.requiresCompanyEvaluation;
      if (col && comp) return 'both';
      if (col && !comp) return 'college_only';
      if (!col && comp) return 'company_only';
      return 'none';
    }
    if (initialPhase === enEvaluationPhase.CollegeEvaluation) return 'college_only';
    if (initialPhase === enEvaluationPhase.CompanyEvaluation) return 'company_only';
    return 'both';
  };

  const [evaluatorMode, setEvaluatorMode] = useState<EvaluatorMode>(determineEvaluatorMode);

  // Questions State
  const [questions, setQuestions] = useState<CreateQuestionDto[]>(() => {
    if (initialData?.questions && initialData.questions.length > 0) {
      return initialData.questions.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        isRequired: q.isRequired ?? true,
        options: q.options || (q.optionsPayload ? JSON.parse(q.optionsPayload) : []),
        optionsPayload: q.optionsPayload,
        order: q.order,
      }));
    }
    return [
      { questionText: '', questionType: enQuestionType.Text, isRequired: true, options: [] },
    ];
  });

  const hasSubmissions = initialData?.hasSubmissions || (initialData?.submissionsCount ?? 0) > 0;

  // Presets for Due Date
  const applyDatePreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  // Question Management
  const addQuestion = () => {
    if (hasSubmissions) return;
    setQuestions((prev) => [
      ...prev,
      { questionText: '', questionType: enQuestionType.Text, isRequired: true, options: [] },
    ]);
  };

  const duplicateQuestion = (idx: number) => {
    if (hasSubmissions) return;
    const target = questions[idx];
    const newQ: CreateQuestionDto = {
      ...target,
      questionText: `${target.questionText} (Copy)`,
      options: target.options ? [...target.options] : [],
    };
    setQuestions((prev) => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, newQ);
      return copy;
    });
  };

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    if (hasSubmissions) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === questions.length - 1) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  };

  const removeQuestion = (idx: number) => {
    if (hasSubmissions) return;
    if (questions.length === 1) {
      toast.error('Template must contain at least one question');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, fields: Partial<CreateQuestionDto>) => {
    if (hasSubmissions) return;
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...fields };
      return copy;
    });
  };

  const handleAddOption = (qIdx: number) => {
    if (hasSubmissions) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = copy[qIdx].options || [];
      copy[qIdx].options = [...opts, `Option ${opts.length + 1}`];
      return copy;
    });
  };

  const handleUpdateOption = (qIdx: number, oIdx: number, val: string) => {
    if (hasSubmissions) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...(copy[qIdx].options || [])];
      opts[oIdx] = val;
      copy[qIdx].options = opts;
      return copy;
    });
  };

  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    if (hasSubmissions) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = (copy[qIdx].options || []).filter((_, i) => i !== oIdx);
      copy[qIdx].options = opts;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Template title is required');
      return;
    }

    if (!dueDate) {
      toast.error('Due date is required');
      return;
    }

    if (!hasSubmissions) {
      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].questionText.trim()) {
          toast.error(`Question #${i + 1} text cannot be empty`);
          return;
        }
      }
    }

    const requiresCollege = evaluatorMode === 'college_only' || evaluatorMode === 'both';
    const requiresCompany = evaluatorMode === 'company_only' || evaluatorMode === 'both';

    await onSave({
      templatePublicId: initialData?.templatePublicId,
      templateTitle: title.trim(),
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      isAvailable,
      requiresCollegeEvaluation: requiresCollege,
      requiresCompanyEvaluation: requiresCompany,
      questions: questions.map((q, idx) => ({ ...q, order: idx + 1 })),
    });
  };

  const questionTypeOptions = [
    { value: enQuestionType.Text, label: 'Text Field (Short / Long Answer)' },
    { value: enQuestionType.MultipleChoice, label: 'Multiple Choice (Single Select)' },
    { value: enQuestionType.Dropdown, label: 'Dropdown Select' },
    { value: enQuestionType.RatingScale, label: 'Rating Scale (1-5 Stars)' },
    { value: enQuestionType.Boolean, label: 'Yes / No Toggle' },
    { value: enQuestionType.Date, label: 'Date Picker' },
    { value: enQuestionType.Time, label: 'Time Picker' },
    { value: enQuestionType.FileUpload, label: 'File Attachment Upload' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submission Warning Banner */}
      {hasSubmissions && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Template Has Active Submissions ({initialData?.submissionsCount || 1} report(s) submitted)
            </p>
            <p className="mt-0.5">
              To safeguard existing student records, the question structure is locked. You can still update
              all settings including <strong>Due Date</strong>, <strong>Availability</strong>, <strong>Evaluator Workflow</strong>, and <strong>Title/Description</strong>.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>General Information</span>
          </h3>
          {initialData && <Badge variant="indigo" size="sm">Editing Mode</Badge>}
        </div>

        <div className="space-y-3">
          <Input
            label="Report Template Title"
            placeholder="e.g. Midterm Summer Training Evaluation Report"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description & Instructions for Students
            </label>
            <textarea
              rows={2}
              placeholder="Provide context, instructions, or guidelines for students submitting this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Template Settings (Due Date, Evaluators, Availability) */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Template Configuration & Rules</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Due Date Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Submission Due Date</span>
              </label>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Required</span>
            </div>

            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Presets:</span>
              <button
                type="button"
                onClick={() => applyDatePreset(7)}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset(14)}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
              >
                +2 Weeks
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset(30)}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
              >
                +1 Month
              </button>
            </div>
          </div>

          {/* Availability Status Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Publishing & Status</span>
                </label>
                <Badge variant={isAvailable ? 'success' : 'neutral'} size="sm">
                  {isAvailable ? 'Active & Published' : 'Draft / Inactive'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAvailable
                  ? 'Students can view and submit reports using this template immediately.'
                  : 'Hidden from students. You can finish editing and publish later.'}
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-indigo-500 transition-colors">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Template is Active for Students
                </span>
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Evaluator Selection (Who Must Evaluate) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users2 className="w-4 h-4 text-indigo-500" />
              <span>Who Must Evaluate This Template? (Evaluation Workflow)</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Define the review pipeline when a student submits this report.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {/* College Supervisor Only */}
            <div
              onClick={() => setEvaluatorMode('college_only')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                evaluatorMode === 'college_only'
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <GraduationCap className={`w-4 h-4 ${evaluatorMode === 'college_only' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${evaluatorMode === 'college_only' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {evaluatorMode === 'college_only' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">College Only</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Evaluated solely by the College Representative.
              </p>
            </div>

            {/* Company Supervisor Only */}
            <div
              onClick={() => setEvaluatorMode('company_only')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                evaluatorMode === 'company_only'
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Building2 className={`w-4 h-4 ${evaluatorMode === 'company_only' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${evaluatorMode === 'company_only' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {evaluatorMode === 'company_only' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Company Only</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Evaluated solely by the Company Supervisor.
              </p>
            </div>

            {/* Both (Company then College) */}
            <div
              onClick={() => setEvaluatorMode('both')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                evaluatorMode === 'both'
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Users2 className={`w-4 h-4 ${evaluatorMode === 'both' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${evaluatorMode === 'both' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {evaluatorMode === 'both' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Both Supervisors</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Company reviews first, then College confirms.
              </p>
            </div>

            {/* No Evaluation / Log Only */}
            <div
              onClick={() => setEvaluatorMode('none')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                evaluatorMode === 'none'
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <FileCheck2 className={`w-4 h-4 ${evaluatorMode === 'none' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${evaluatorMode === 'none' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {evaluatorMode === 'none' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Self-Report / Log</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Auto-completes upon submission without scoring.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Dynamic Questions Builder */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Form Questions Builder</span>
              <span className="text-xs font-normal text-slate-400">({questions.length} question(s))</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Customize questions and input types for students.
            </p>
          </div>

          {!hasSubmissions && (
            <Button type="button" variant="outline" size="sm" onClick={addQuestion} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Question
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Question Header Actions */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Question #{qIdx + 1}
                  </span>
                  {q.isRequired && (
                    <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>

                {!hasSubmissions && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={qIdx === 0}
                      onClick={() => moveQuestion(qIdx, 'up')}
                      title="Move Up"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={qIdx === questions.length - 1}
                      onClick={() => moveQuestion(qIdx, 'down')}
                      title="Move Down"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateQuestion(qIdx)}
                      title="Duplicate Question"
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      title="Delete Question"
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Question Text & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Enter question prompt (e.g. What major technical skills did you apply this week?)..."
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value })}
                    disabled={hasSubmissions}
                    required
                  />
                </div>
                <div>
                  <Select
                    value={q.questionType}
                    onChange={(e) => updateQuestion(qIdx, { questionType: e.target.value as enQuestionType })}
                    options={questionTypeOptions}
                    disabled={hasSubmissions}
                  />
                </div>
              </div>

              {/* Options for MultipleChoice or Dropdown */}
              {(q.questionType === enQuestionType.MultipleChoice || q.questionType === enQuestionType.Dropdown) && (
                <div className="pl-4 border-l-2 border-indigo-500 space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Choice Options</label>
                    {!hasSubmissions && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        + Add Choice Option
                      </button>
                    )}
                  </div>
                  {(q.options || []).map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => handleUpdateOption(qIdx, oIdx, e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        disabled={hasSubmissions}
                      />
                      {!hasSubmissions && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIdx, oIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Required Toggle */}
              {!hasSubmissions && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={(e) => updateQuestion(qIdx, { isRequired: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Mandatory field (Student must answer)</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs text-slate-400">
          Due Date: <strong className="text-slate-700 dark:text-slate-300">{dueDate}</strong> • Status: <strong className="text-slate-700 dark:text-slate-300">{isAvailable ? 'Active' : 'Draft'}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
            {initialData ? 'Update Template & Settings' : 'Create & Publish Template'}
          </Button>
        </div>
      </div>
    </form>
  );
};
