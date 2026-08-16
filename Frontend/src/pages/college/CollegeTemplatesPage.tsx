import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit,
  Settings,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  Building2,
  GraduationCap,
  Users2,
  FileCheck2,
  Search,
  Filter,
  AlertCircle,
  FileText,
  HelpCircle,
  Star,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { reportsService } from '../../api/reportsService';
import {
  CollegeReportTemplateDto,
  SaveTemplateDto,
  TemplateDetailsDto,
} from '../../types/reports';
import { enEvaluationPhase, enQuestionType } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { ReportTemplateBuilder } from '../../components/dynamic-form/ReportTemplateBuilder';

export const CollegeTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<CollegeReportTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [evaluatorFilter, setEvaluatorFilter] = useState<'all' | 'college' | 'company' | 'both' | 'none'>('all');

  // Modals State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [quickSettingsModalOpen, setQuickSettingsModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const [activeTemplateDetails, setActiveTemplateDetails] = useState<TemplateDetailsDto | null>(null);
  const [quickSettingsTemplate, setQuickSettingsTemplate] = useState<CollegeReportTemplateDto | null>(null);
  const [quickDueDate, setQuickDueDate] = useState('');
  const [quickIsAvailable, setQuickIsAvailable] = useState(true);
  const [quickEvaluatorMode, setQuickEvaluatorMode] = useState<'college_only' | 'company_only' | 'both' | 'none'>('college_only');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDescription, setQuickDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getCollegeTemplates();
      setTemplates(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load college report templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle Create Template
  const handleCreateTemplate = async (dto: SaveTemplateDto) => {
    try {
      setSubmitting(true);
      await reportsService.createReportTemplate(dto);
      toast.success('College report template created successfully');
      setCreateModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.devMessage || err.response?.data?.message || 'Failed to create report template.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Open Edit Modal
  const handleOpenEdit = async (templatePublicId: string) => {
    try {
      setLoadingDetails(true);
      const details = await reportsService.getTemplateDetails(templatePublicId);
      setActiveTemplateDetails(details);
      setEditModalOpen(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load template details for editing.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle Save Edited Template
  const handleUpdateTemplate = async (dto: SaveTemplateDto) => {
    if (!activeTemplateDetails) return;
    try {
      setSubmitting(true);
      await reportsService.updateTemplate(activeTemplateDetails.templatePublicId, dto);
      toast.success('Report template and settings updated successfully');
      setEditModalOpen(false);
      setActiveTemplateDetails(null);
      fetchTemplates();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.devMessage || err.response?.data?.message || 'Failed to update report template.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Open Quick Settings Modal
  const handleOpenQuickSettings = (item: CollegeReportTemplateDto) => {
    setQuickSettingsTemplate(item);
    setQuickTitle(item.title);
    setQuickDescription(item.description || '');
    setQuickIsAvailable(item.isAvailable);

    try {
      setQuickDueDate(new Date(item.dueDate).toISOString().split('T')[0]);
    } catch {
      setQuickDueDate('');
    }

    if (item.requiresCollegeEvaluation && item.requiresCompanyEvaluation) {
      setQuickEvaluatorMode('both');
    } else if (item.requiresCollegeEvaluation) {
      setQuickEvaluatorMode('college_only');
    } else if (item.requiresCompanyEvaluation) {
      setQuickEvaluatorMode('company_only');
    } else {
      setQuickEvaluatorMode('none');
    }

    setQuickSettingsModalOpen(true);
  };

  // Handle Save Quick Settings
  const handleSaveQuickSettings = async () => {
    if (!quickSettingsTemplate) return;
    if (!quickTitle.trim()) {
      toast.error('Template title is required');
      return;
    }
    if (!quickDueDate) {
      toast.error('Due date is required');
      return;
    }

    try {
      setSubmitting(true);
      const requiresCollege = quickEvaluatorMode === 'college_only' || quickEvaluatorMode === 'both';
      const requiresCompany = quickEvaluatorMode === 'company_only' || quickEvaluatorMode === 'both';

      await reportsService.updateTemplate(quickSettingsTemplate.templatePublicId, {
        templatePublicId: quickSettingsTemplate.templatePublicId,
        templateTitle: quickTitle.trim(),
        title: quickTitle.trim(),
        description: quickDescription.trim(),
        dueDate: new Date(quickDueDate).toISOString(),
        isAvailable: quickIsAvailable,
        requiresCollegeEvaluation: requiresCollege,
        requiresCompanyEvaluation: requiresCompany,
        questions: [], // No question changes in quick settings
      });

      toast.success('Template settings updated');
      setQuickSettingsModalOpen(false);
      setQuickSettingsTemplate(null);
      fetchTemplates();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.devMessage || err.response?.data?.message || 'Failed to update settings.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Open Preview Modal
  const handleOpenPreview = async (templatePublicId: string) => {
    try {
      setLoadingDetails(true);
      const details = await reportsService.getTemplateDetails(templatePublicId);
      setActiveTemplateDetails(details);
      setPreviewModalOpen(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load template preview.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle Delete Template
  const handleDelete = async (publicId: string) => {
    if (!window.confirm('Are you sure you want to delete this report template? This action cannot be undone.')) return;
    try {
      await reportsService.deleteTemplate(publicId);
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.devMessage || err.response?.data?.message || 'Failed to delete template. Templates with existing student reports cannot be deleted.';
      toast.error(msg);
    }
  };

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      // Search
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.isAvailable) ||
        (statusFilter === 'draft' && !item.isAvailable);

      // Evaluators
      let matchesEvaluator = true;
      if (evaluatorFilter === 'college') {
        matchesEvaluator = item.requiresCollegeEvaluation && !item.requiresCompanyEvaluation;
      } else if (evaluatorFilter === 'company') {
        matchesEvaluator = !item.requiresCollegeEvaluation && item.requiresCompanyEvaluation;
      } else if (evaluatorFilter === 'both') {
        matchesEvaluator = item.requiresCollegeEvaluation && item.requiresCompanyEvaluation;
      } else if (evaluatorFilter === 'none') {
        matchesEvaluator = !item.requiresCollegeEvaluation && !item.requiresCompanyEvaluation;
      }

      return matchesSearch && matchesStatus && matchesEvaluator;
    });
  }, [templates, searchTerm, statusFilter, evaluatorFilter]);

  // KPI Metrics Calculation
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.isAvailable).length;
    const drafts = total - active;
    const totalSubmissions = templates.reduce((acc, curr) => acc + (curr.submissionsCount || 0), 0);

    const now = new Date();
    const dueSoon = templates.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 5;
    }).length;

    return { total, active, drafts, totalSubmissions, dueSoon };
  }, [templates]);

  // Helper for Evaluator Badge
  const renderEvaluatorBadge = (item: CollegeReportTemplateDto) => {
    if (item.requiresCollegeEvaluation && item.requiresCompanyEvaluation) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
          <Users2 className="w-3 h-3" />
          <span>Both (College & Company)</span>
        </span>
      );
    }
    if (item.requiresCollegeEvaluation) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">
          <GraduationCap className="w-3 h-3" />
          <span>College Supervisor Only</span>
        </span>
      );
    }
    if (item.requiresCompanyEvaluation) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
          <Building2 className="w-3 h-3" />
          <span>Company Supervisor Only</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
        <FileCheck2 className="w-3 h-3" />
        <span>Self-Report / Log</span>
      </span>
    );
  };

  // Helper for Due Date Badge
  const renderDueDateBadge = (dueDateStr?: string) => {
    if (!dueDateStr) {
      return <span className="text-xs text-slate-400">No deadline</span>;
    }
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
            <span>In {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{due.toLocaleDateString()}</p>
        </div>
      );
    }

    return (
      <div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900">
          <Calendar className="w-3 h-3" />
          <span>In {diffDays} days</span>
        </span>
        <p className="text-[11px] text-slate-400 mt-0.5">{due.toLocaleDateString()}</p>
      </div>
    );
  };

  const columns: Column<CollegeReportTemplateDto>[] = [
    {
      header: 'Template Details',
      cell: (item) => (
        <div className="max-w-xs sm:max-w-sm space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white text-sm hover:text-indigo-600 transition-colors">
            {item.title}
          </p>
          {item.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {item.description}
            </p>
          )}
          <p className="text-[11px] text-slate-400">
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: 'Submission Due Date',
      cell: (item) => renderDueDateBadge(item.dueDate),
    },
    {
      header: 'Evaluators Workflow',
      cell: (item) => renderEvaluatorBadge(item),
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.isAvailable ? 'success' : 'neutral'} size="sm">
          {item.isAvailable ? 'Active / Published' : 'Draft / Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Questions & Submissions',
      cell: (item) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>{item.questionsCount} questions</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
            <Users2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{item.submissionsCount || 0} response(s)</span>
          </div>
        </div>
      ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item.templatePublicId)}
            title="Edit Template & Questions"
            className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenQuickSettings(item)}
            title="Quick Settings (Due Date, Evaluators, Status)"
            className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenPreview(item.templatePublicId)}
            title="Preview Student Form"
            className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(item.templatePublicId)}
            title="Delete Template"
            className="p-1.5 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
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
            <span>{t('nav.reportTemplates')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure dynamic evaluation forms, due dates, evaluator workflows, and publish questionnaires to students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Template
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Templates</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">forms configured</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-emerald-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active & Published</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</span>
            <span className="text-xs text-emerald-600 font-medium">visible to students</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-amber-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Due Soon (≤ 5 Days)</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.dueSoon}</span>
            <span className="text-xs text-amber-600 font-medium">approaching deadline</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-sky-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-sky-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student Responses</span>
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSubmissions}</span>
            <span className="text-xs text-slate-400">submitted reports</span>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search templates by title or instructions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active / Published' },
              { value: 'draft', label: 'Draft / Inactive' },
            ]}
          />

          {/* Evaluator Filter */}
          <Select
            value={evaluatorFilter}
            onChange={(e) => setEvaluatorFilter(e.target.value as any)}
            options={[
              { value: 'all', label: 'All Evaluators' },
              { value: 'college', label: 'College Only' },
              { value: 'company', label: 'Company Only' },
              { value: 'both', label: 'Both Supervisors' },
              { value: 'none', label: 'Self-Report / None' },
            ]}
          />
        </div>
      </div>

      {/* Templates Table */}
      <Table
        columns={columns}
        data={filteredTemplates}
        keyExtractor={(item) => item.templatePublicId}
        isLoading={loading}
        emptyMessage="No college report templates match your search or filter criteria."
      />

      {/* MODAL 1: Create New Template */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New College Report Template"
        maxWidth="2xl"
      >
        <ReportTemplateBuilder
          initialPhase={enEvaluationPhase.CollegeEvaluation}
          onSave={handleCreateTemplate}
          onCancel={() => setCreateModalOpen(false)}
          isLoading={submitting}
        />
      </Modal>

      {/* MODAL 2: Edit Template & Questions */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setActiveTemplateDetails(null);
        }}
        title="Edit College Report Template & Settings"
        maxWidth="2xl"
      >
        {activeTemplateDetails && (
          <ReportTemplateBuilder
            initialData={activeTemplateDetails}
            initialPhase={enEvaluationPhase.CollegeEvaluation}
            onSave={handleUpdateTemplate}
            onCancel={() => {
              setEditModalOpen(false);
              setActiveTemplateDetails(null);
            }}
            isLoading={submitting}
          />
        )}
      </Modal>

      {/* MODAL 3: Quick Settings Modal */}
      <Modal
        isOpen={quickSettingsModalOpen}
        onClose={() => {
          setQuickSettingsModalOpen(false);
          setQuickSettingsTemplate(null);
        }}
        title="Quick Template Settings"
        maxWidth="md"
      >
        {quickSettingsTemplate && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly update settings for <strong className="text-slate-800 dark:text-slate-200">"{quickSettingsTemplate.title}"</strong> without modifying questions.
            </p>

            <div className="space-y-3">
              <Input
                label="Template Title"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Submission Due Date
                </label>
                <Input
                  type="date"
                  value={quickDueDate}
                  onChange={(e) => setQuickDueDate(e.target.value)}
                  required
                />
              </div>

              {/* Evaluators Mode */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Who Must Evaluate?
                </label>
                <Select
                  value={quickEvaluatorMode}
                  onChange={(e) => setQuickEvaluatorMode(e.target.value as any)}
                  options={[
                    { value: 'college_only', label: '🏛️ College Supervisor Only' },
                    { value: 'company_only', label: '🏢 Company Supervisor Only' },
                    { value: 'both', label: '🔄 Both Supervisors (Company then College)' },
                    { value: 'none', label: '📋 Self-Report / Log (No Review)' },
                  ]}
                />
              </div>

              {/* Availability Toggle */}
              <div className="pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Active for Students
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {quickIsAvailable ? 'Visible and ready for submissions' : 'Hidden from students (Draft)'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={quickIsAvailable}
                    onChange={(e) => setQuickIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => {
                  setQuickSettingsModalOpen(false);
                  setQuickSettingsTemplate(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveQuickSettings} isLoading={submitting}>
                Save Settings
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: Student Form Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setActiveTemplateDetails(null);
        }}
        title="Form Preview (Student View)"
        maxWidth="lg"
      >
        {activeTemplateDetails && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeTemplateDetails.title}
                </h3>
                <Badge variant={activeTemplateDetails.isAvailable ? 'success' : 'neutral'} size="sm">
                  {activeTemplateDetails.isAvailable ? 'Active' : 'Draft'}
                </Badge>
              </div>

              {activeTemplateDetails.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activeTemplateDetails.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-indigo-100/60 dark:border-indigo-950">
                <span>
                  Due Date: <strong className="text-slate-700 dark:text-slate-300">{new Date(activeTemplateDetails.dueDate).toLocaleDateString()}</strong>
                </span>
                <span>•</span>
                <span>
                  Evaluators: <strong className="text-slate-700 dark:text-slate-300">{activeTemplateDetails.requiresCollegeEvaluation && activeTemplateDetails.requiresCompanyEvaluation ? 'Both' : activeTemplateDetails.requiresCollegeEvaluation ? 'College Only' : activeTemplateDetails.requiresCompanyEvaluation ? 'Company Only' : 'None'}</strong>
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Questionnaire Fields ({activeTemplateDetails.questions.length})
              </h4>

              {activeTemplateDetails.questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {idx + 1}. {q.questionText}
                      {q.isRequired && <span className="text-rose-500 ml-1">*</span>}
                    </span>
                    <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {q.questionType}
                    </span>
                  </div>

                  {/* Options render if multiple choice or dropdown */}
                  {(q.questionType === enQuestionType.MultipleChoice || q.questionType === enQuestionType.Dropdown) && (
                    <div className="pl-3 space-y-1">
                      {((q.options && q.options.length > 0) ? q.options : (q.optionsPayload ? JSON.parse(q.optionsPayload) : [])).map((opt: string, oIdx: number) => (
                        <div key={oIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setPreviewModalOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
