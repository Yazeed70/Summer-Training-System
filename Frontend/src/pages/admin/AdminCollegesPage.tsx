import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Building2, Plus, Edit, Power, Trash2 } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { CollegesListDto, CollegeDetailsDto, CreateCollegeDto } from '../../types/dashboard';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const AdminCollegesPage: React.FC = () => {
  const { t } = useTranslation();
  const [colleges, setColleges] = useState<CollegesListDto[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

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
      name,
      contactEmail: contactEmail || undefined,
      address: address || undefined,
    };

    try {
      setSubmitting(true);
      if (editingCollege) {
        await adminService.updateCollege(editingCollege.id, dto);
        toast.success('College updated successfully');
      } else {
        await adminService.createCollege(dto);
        toast.success('College created successfully');
      }
      setModalOpen(false);
      fetchColleges();
    } catch (err) {
      console.error(err);
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
      toast.success('College status updated');
      setToggleConfirmOpen(false);
      fetchColleges();
    } catch (err) {
      console.error(err);
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
      toast.success('College deleted');
      setDeleteConfirmOpen(false);
      fetchColleges();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<CollegesListDto>[] = [
    {
      header: 'College Name',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
          <p className="text-xs text-slate-400">{item.address || 'No address'}</p>
        </div>
      ),
    },
    {
      header: 'Address',
      cell: (item) => item.address || '-',
    },
    {
      header: 'Total Students',
      cell: (item) => item.totalStudents ?? 0,
    },
    {
      header: t('common.status'),
      cell: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? t('common.active') : t('common.inactive')}
        </Badge>
      ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)} title="Edit">
            <Edit className="w-4 h-4 text-indigo-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenToggleConfirm(item)} title="Toggle Status">
            <Power className={`w-4 h-4 ${item.isActive ? 'text-rose-500' : 'text-emerald-500'}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteConfirm(item.id, item.name)} title="Delete">
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.colleges')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage participating university colleges and academic details
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add New College
        </Button>
      </div>

      <Table columns={columns} data={colleges} keyExtractor={(item) => item.id} isLoading={loading} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCollege ? 'Edit College' : 'Add New College'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="College Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Contact Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="college@university.edu.sa" />
          <Input label="College Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Campus Address" />
          
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingCollege ? 'Update College' : 'Create College'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={toggleConfirmOpen}
        onClose={() => setToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={targetToggleCollege?.isActive ? 'Deactivate College' : 'Activate College'}
        message={`Are you sure you want to ${targetToggleCollege?.isActive ? 'deactivate' : 'activate'} "${targetToggleCollege?.name}"?`}
        confirmText={targetToggleCollege?.isActive ? 'Deactivate' : 'Activate'}
        variant={targetToggleCollege?.isActive ? 'danger' : 'success'}
        isLoading={submitting}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete College"
        message={`Are you sure you want to delete college "${targetCollegeName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};
