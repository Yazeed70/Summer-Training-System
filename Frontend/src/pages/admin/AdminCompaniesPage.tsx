import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Power,
  CheckCircle,
  Trash2,
  ShieldAlert,
  Search,
  RefreshCw,
  MapPin,
  Mail,
  Users,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { CompaniesListDto, CreateCompanyDto } from '../../types/dashboard';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Card } from '../../components/ui/Card';

export const AdminCompaniesPage: React.FC = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<CompaniesListDto[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompaniesListDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'approved' | 'pending' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompaniesListDto | null>(null);

  // Form Fields State (Matching backend database schema: Name, ContactEmail, Address)
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modals
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [targetApproveId, setTargetApproveId] = useState<number | null>(null);
  const [targetApproveName, setTargetApproveName] = useState('');

  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [targetToggleCompany, setTargetToggleCompany] = useState<CompaniesListDto | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<number | null>(null);
  const [targetDeleteName, setTargetDeleteName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const compList = await adminService.getAllCompanies();
      setCompanies(compList);
      setFilteredCompanies(compList);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...companies];

    if (filterTab === 'approved') {
      result = result.filter((c) => c.isApproved);
    } else if (filterTab === 'pending') {
      result = result.filter((c) => !c.isApproved);
    } else if (filterTab === 'inactive') {
      result = result.filter((c) => !c.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q)
      );
    }

    setFilteredCompanies(result);
  }, [searchQuery, filterTab, companies]);

  // Statistics
  const totalCompanies = companies.length;
  const approvedCompanies = companies.filter((c) => c.isApproved).length;
  const pendingApprovals = companies.filter((c) => !c.isApproved).length;
  const activeCompanies = companies.filter((c) => c.isActive).length;

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setName('');
    setContactEmail('');
    setAddress('');
    setModalOpen(true);
  };

  const handleOpenEdit = async (comp: CompaniesListDto) => {
    setEditingCompany(comp);
    setName(comp.name);
    setAddress(comp.address || '');
    try {
      const details = await adminService.getCompanyById(comp.id);
      setContactEmail(details.contactEmail || '');
    } catch {
      setContactEmail('');
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!address.trim()) {
      toast.error('Company address is required');
      return;
    }
    const dto: CreateCompanyDto = {
      name: name.trim(),
      contactEmail: contactEmail.trim() || undefined,
      address: address.trim(),
    };

    try {
      setSubmitting(true);
      if (editingCompany) {
        await adminService.updateCompany(editingCompany.id, dto);
        toast.success('Company updated successfully');
      } else {
        await adminService.createCompany(dto);
        toast.success('Company created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save company:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenApproveConfirm = (id: number, name: string) => {
    setTargetApproveId(id);
    setTargetApproveName(name);
    setApproveConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!targetApproveId) return;
    try {
      setSubmitting(true);
      await adminService.approveCompany(targetApproveId);
      toast.success(`Company "${targetApproveName}" accredited successfully`);
      setApproveConfirmOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to approve company:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenToggleConfirm = (comp: CompaniesListDto) => {
    setTargetToggleCompany(comp);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetToggleCompany) return;
    try {
      setSubmitting(true);
      await adminService.toggleCompanyStatus(targetToggleCompany.id);
      toast.success('Company status updated');
      setToggleConfirmOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (id: number, name: string) => {
    setTargetDeleteId(id);
    setTargetDeleteName(name);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteId) return;
    try {
      setSubmitting(true);
      await adminService.deleteCompany(targetDeleteId);
      toast.success('Company deleted successfully');
      setDeleteConfirmOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to delete company:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<CompaniesListDto>[] = [
    {
      header: t('admin.companyNameCol', 'Partner Company Name'),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{item.address || t('admin.noHeadquartersSpecified', 'Headquarters not specified')}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: t('admin.enrolledTraineesCol', 'Enrolled Trainees'),
      cell: (item) => (
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('admin.traineesCount', { count: item.totalStudents ?? 0 })}</span>
        </div>
      ),
    },
    {
      header: t('admin.accreditationCol', 'Accreditation'),
      cell: (item) => (
        <Badge variant={item.isApproved ? 'success' : 'warning'} size="sm">
          {item.isApproved ? (
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {t('admin.accreditedBadge', 'Accredited Partner')}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> {t('admin.pendingReviewBadge', 'Pending Review')}
            </span>
          )}
        </Badge>
      ),
    },
    {
      header: t('common.status', 'Status'),
      cell: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'} size="sm">
          {item.isActive ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {t('common.active', 'Active')}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3" /> {t('common.suspended', 'Suspended')}
            </span>
          )}
        </Badge>
      ),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <div className="flex items-center gap-1">
          {!item.isApproved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenApproveConfirm(item.id, item.name)}
              title={t('admin.accreditCompanyTitle', 'Accredit / Approve Company')}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 hover:text-emerald-700" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            title={t('admin.editCompanyTitle', 'Edit Company Details')}
          >
            <Edit className="w-4 h-4 text-indigo-600 hover:text-indigo-700" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenToggleConfirm(item)}
            title={item.isActive ? t('admin.deactivateAccount', 'Deactivate Company') : t('admin.activateAccount', 'Activate Company')}
          >
            <Power className={`w-4 h-4 ${item.isActive ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDeleteConfirm(item.id, item.name)}
            title={t('common.delete', 'Delete Company')}
          >
            <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-600" />
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
            {t('admin.companiesTitle', 'Partner Companies & Training Entities')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('admin.companiesSubtitle', 'Manage corporate training providers, review accreditation applications, and monitor trainee placement capacity')}
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
            {t('common.refresh', 'Refresh')}
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-md"
          >
            {t('admin.addCompanyBtn', 'Add New Company')}
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-400">{t('admin.totalRegisteredCompanies', 'Total Registered Companies')}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCompanies}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-emerald-500">{t('admin.accreditedPartners', 'Accredited Partners')}</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{approvedCompanies}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-amber-500">{t('admin.pendingAccreditation', 'Pending Accreditation')}</p>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingApprovals}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-sky-500">{t('admin.activeEntities', 'Active Entities')}</p>
          <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">{activeCompanies}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder={t('admin.searchCompaniesPlaceholder', 'Search by company name or address...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 overflow-x-auto pb-1 text-xs">
          {[
            { key: 'all', label: t('admin.allCompanies', 'All Companies'), count: totalCompanies },
            { key: 'approved', label: t('admin.accreditedPartnersTab', 'Accredited Partners'), count: approvedCompanies },
            { key: 'pending', label: t('admin.pendingApprovalsTab', 'Pending Approvals'), count: pendingApprovals },
            { key: 'inactive', label: t('admin.inactiveCompaniesTab', 'Inactive / Suspended'), count: totalCompanies - activeCompanies },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                filterTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Companies Table */}
      <Table
        columns={columns}
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        isLoading={loading}
        emptyMessage={
          searchQuery || filterTab !== 'all'
            ? t('common.noData', 'No companies found matching your filter criteria.')
            : t('common.noData', 'No companies registered yet. Click Add New Company to register one.')
        }
      />

      {/* Create / Edit Company Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCompany ? t('admin.editCompanyTitle', 'Edit Corporate Information') : t('admin.registerCompanyTitle', 'Register New Partner Company')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('admin.companyNameLabel', 'Company / Enterprise Name *')}
            placeholder={t('admin.companyNamePlaceholder', 'e.g. Saudi Aramco / STC Solutions')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            helperText={t('admin.companyNameHelper', 'Official registered commercial trade name.')}
          />

          <Input
            label={t('admin.companyContactEmailLabel', 'Official Contact Email')}
            type="email"
            placeholder="training@company.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            helperText={t('admin.companyContactEmailHelper', 'Primary email used for student reports & evaluations.')}
          />

          <Input
            label={t('admin.companyAddressLabel', 'Headquarters / Office Address *')}
            placeholder={t('admin.companyAddressPlaceholder', 'e.g. King Fahd Road, Riyadh')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            required
            helperText={t('admin.companyAddressHelper', 'Physical office or training facility location.')}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {editingCompany ? t('admin.updateCompanyBtn', 'Update Company') : t('admin.registerCompanyBtn', 'Register Company')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approve Confirm Modal */}
      <ConfirmModal
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title={t('admin.accreditCompanyTitle', 'Approve Company Accreditation')}
        message={`Are you sure you want to accredit and approve company "${targetApproveName}" for student summer training programs?`}
        confirmText={t('admin.accreditPartnerBtn', 'Accredit Partner')}
        variant="success"
        isLoading={submitting}
      />

      {/* Status Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={toggleConfirmOpen}
        onClose={() => setToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={targetToggleCompany?.isActive ? t('admin.deactivateAccount', 'Deactivate Company') : t('admin.activateAccount', 'Activate Company')}
        message={`Are you sure you want to ${targetToggleCompany?.isActive ? 'deactivate' : 'activate'} "${targetToggleCompany?.name}"?`}
        confirmText={targetToggleCompany?.isActive ? t('common.suspended', 'Deactivate') : t('common.active', 'Activate')}
        variant={targetToggleCompany?.isActive ? 'danger' : 'success'}
        isLoading={submitting}
      />

      {/* Delete Company Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('common.delete', 'Delete Company')}
        message={`Are you sure you want to delete company "${targetDeleteName}"? This action will fail if the company has linked trainees or representatives.`}
        confirmText={t('common.delete', 'Delete')}
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};
