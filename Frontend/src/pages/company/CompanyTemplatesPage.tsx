import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import { reportsService } from '../../api/reportsService';
import { CollegeReportTemplateDto, SaveTemplateDto } from '../../types/reports';
import { enEvaluationPhase } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ReportTemplateBuilder } from '../../components/dynamic-form/ReportTemplateBuilder';

export const CompanyTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<CollegeReportTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getCompanyTemplates();
      setTemplates(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async (dto: SaveTemplateDto) => {
    try {
      setSubmitting(true);
      await reportsService.createReportTemplate(dto);
      toast.success('Company report template created');
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

  const handleDelete = async (publicId: string) => {
    if (!window.confirm('Delete this report template?')) return;
    try {
      await reportsService.deleteTemplate(publicId);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<CollegeReportTemplateDto>[] = [
    {
      header: 'Template Title',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
          <p className="text-xs text-slate-400">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      header: 'Questions',
      cell: (item) => `${item.questionsCount} Questions`,
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.templatePublicId)}>
          <Trash2 className="w-4 h-4 text-rose-500" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.reportTemplates')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create dynamic evaluation forms and weekly logs for company trainees
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create New Template
        </Button>
      </div>

      <Table columns={columns} data={templates} keyExtractor={(item) => item.templatePublicId} isLoading={loading} emptyMessage="No company report templates created yet." />

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Company Report Template" maxWidth="xl">
        <ReportTemplateBuilder
          initialPhase={enEvaluationPhase.CompanyEvaluation}
          onSave={handleSaveTemplate}
          onCancel={() => setCreateModalOpen(false)}
          isLoading={submitting}
        />
      </Modal>
    </div>
  );
};
