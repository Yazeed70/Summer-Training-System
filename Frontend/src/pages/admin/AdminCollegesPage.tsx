import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  School,
  Plus,
  Edit,
  Power,
  Trash2,
  Search,
  RefreshCw,
  MapPin,
  Mail,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { CollegesListDto, CreateCollegeDto } from '../../types/dashboard';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';

export const AdminCollegesPage: React.FC = () => {
  const { t } = useTranslation();
  const [colleges, setColleges] = useState<CollegesListDto[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<CollegesListDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegesListDto | null>(null);

  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetCollegeId, setTargetCollegeId] = useState<number | null>(null);
  const [targetCollegeName, setTargetCollegeName] = useState<string>('');

  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [targetToggleCollege, setTargetToggleCollege] = useState<CollegesListDto | null>(null);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllColleges();
      setColleges(res);
      setFilteredColleges(res);
    } catch (err) {
      console.error('Failed to load colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    let result = [...colleges];

    if (statusFilter === 'active') {
      result = result.filter((c) => c.isActive);
    } else if (statusFilter === 'inactive') {
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

    setFilteredColleges(result);
  }, [searchQuery, statusFilter, colleges]);

  // Metric counts
  const totalColleges = colleges.length;
  const activeColleges = colleges.filter((c) => c.isActive).length;
  const inactiveColleges = totalColleges - activeColleges;
  const totalEnrolledStudents = colleges.reduce((sum, c) => sum + (c.totalStudents || 0), 0);

  const handleOpenCreate = () => {
    setEditingCollege(null);
    setName('');
    setContactEmail('');
    setAddress('');
    setModalOpen(true);
  };

  const handleOpenEdit = async (collegeItem: CollegesListDto) => {
    setEditingCollege(collegeItem);
    setName(collegeItem.name);
    setAddress(collegeItem.address || '');
    try {
      const details = await adminService.getCollegeById(collegeItem.id);
      setContactEmail(details.contactEmail || '');
    } catch {
      setContactEmail('');
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('College name is required');
      return;
    }
    const dto: CreateCollegeDto = {
      name: name.trim(),
      contactEmail: contactEmail.trim() || undefined,
      address: address.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingCollege) {
        await adminService.updateCollege(editingCollege.id, dto);
        toast.success('College information updated successfully');
      } else {
        await adminService.createCollege(dto);
        toast.success('College registered successfully');
      }
      setModalOpen(false);
      fetchColleges();
    } catch (err) {
      console.error('Failed to save college:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenToggleConfirm = (college: CollegesListDto) => {
    setTargetToggleCollege(college);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetToggleCollege) return;
    try {
      setSubmitting(true);
      await adminService.toggleCollegeStatus(targetToggleCollege.id);
      toast.success(`College "${targetToggleCollege.name}" status updated`);
      setToggleConfirmOpen(false);
      fetchColleges();
    } catch (err) {
      console.error('Failed to toggle college status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (id: number, name: string) => {
    setTargetCollegeId(id);
    setTargetCollegeName(name);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetCollegeId) return;
    try {
      setSubmitting(true);
      await adminService.deleteCollege(targetCollegeId);
      toast.success(`College "${targetCollegeName}" deleted successfully`);
      setDeleteConfirmOpen(false);
      fetchColleges();
    } catch (err) {
      console.error('Failed to delete college:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<CollegesListDto>[] = [
    {
      header: t('admin.collegeNameCol', 'College / Faculty Name'),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{item.address || t('admin.noAddressSpecified', 'Campus address not specified')}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: t('admin.enrolledStudentsCol', 'Enrolled Students'),
      cell: (item) => (
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t('admin.studentsCount', { count: item.totalStudents ?? 0 })}</span>
        </div>
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
              <XCircle className="w-3 h-3" /> {t('common.inactive', 'Inactive')}
            </span>
          )}
        </Badge>
      ),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            title={t('admin.editCollegeTitle', 'Edit College Information')}
          >
            <Edit className="w-4 h-4 text-indigo-600 hover:text-indigo-700" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenToggleConfirm(item)}
            title={item.isActive ? t('admin.deactivateCollegeTitle', 'Deactivate College') : t('admin.activateCollegeTitle', 'Activate College')}
          >
            <Power className={`w-4 h-4 ${item.isActive ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDeleteConfirm(item.id, item.name)}
            title={t('admin.deleteCollegeTitle', 'Delete College')}
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
            {t('admin.collegesTitle', 'Academic Colleges & Faculties Management')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('admin.collegesSubtitle', 'Manage registered university faculties, campus coordinates, and monitor student distribution')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchColleges}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            {t('common.refresh', 'Refresh')}
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-md"
          >
            {t('admin.addCollegeBtn', 'Add New College')}
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-400">{t('admin.totalRegisteredColleges', 'Total Registered Colleges')}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalColleges}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-emerald-500">{t('admin.activeFaculties', 'Active Faculties')}</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{activeColleges}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-rose-500">{t('admin.inactiveColleges', 'Inactive / Suspended')}</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{inactiveColleges}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-sky-500">{t('admin.totalEnrolledStudents', 'Total Enrolled Students')}</p>
          <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">{totalEnrolledStudents}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder={t('admin.searchCollegesPlaceholder', 'Search by college name or address...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'all', label: t('admin.allStatuses', 'All Statuses') },
                { value: 'active', label: t('admin.activeOnly', 'Active Only') },
                { value: 'inactive', label: t('admin.inactiveOnly', 'Inactive Only') },
              ]}
              className="w-full sm:w-36"
            />
          </div>
        </div>
      </Card>

      {/* Colleges Table */}
      <Table
        columns={columns}
        data={filteredColleges}
        keyExtractor={(item) => item.id}
        isLoading={loading}
        emptyMessage={
          searchQuery || statusFilter !== 'all'
            ? t('common.noData', 'No colleges found matching your search filter.')
            : t('common.noData', 'No colleges registered in the system yet.')
        }
      />

      {/* Create / Edit College Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCollege ? t('admin.editCollegeTitle', 'Edit College Details') : t('admin.registerCollegeTitle', 'Register New University College')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('admin.collegeNameLabel', 'College / Faculty Name *')}
            placeholder={t('admin.collegeNamePlaceholder', 'e.g. College of Computer & Information Sciences')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            helperText={t('admin.collegeNameHelper', 'Official university faculty name.')}
          />

          <Input
            label={t('admin.contactEmailLabel', 'Official Contact Email')}
            type="email"
            placeholder="college@university.edu.sa"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            helperText={t('admin.contactEmailHelper', 'Primary email used for college administration.')}
          />

          <Input
            label={t('admin.campusAddressLabel', 'Campus Address / Building')}
            placeholder={t('admin.campusAddressPlaceholder', 'e.g. Building 31, Main Campus, Riyadh')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            helperText={t('admin.campusAddressHelper', 'Physical campus location.')}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {editingCollege ? t('admin.updateCollegeBtn', 'Update College') : t('admin.registerCollegeBtn', 'Register College')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={toggleConfirmOpen}
        onClose={() => setToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={targetToggleCollege?.isActive ? t('admin.deactivateCollegeTitle', 'Deactivate College') : t('admin.activateCollegeTitle', 'Activate College')}
        message={`Are you sure you want to ${targetToggleCollege?.isActive ? 'deactivate' : 'activate'} "${targetToggleCollege?.name}"?`}
        confirmText={targetToggleCollege?.isActive ? t('common.suspended', 'Deactivate') : t('common.active', 'Activate')}
        variant={targetToggleCollege?.isActive ? 'danger' : 'success'}
        isLoading={submitting}
      />

      {/* Delete College Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('admin.deleteCollegeTitle', 'Delete College')}
        message={`Are you sure you want to delete college "${targetCollegeName}"? This action will fail if the college has linked students or representatives.`}
        confirmText={t('common.delete', 'Delete')}
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};
