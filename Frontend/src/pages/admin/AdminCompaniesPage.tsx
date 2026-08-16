import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Building, Plus, Edit, Power, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { CompaniesListDto, PendingCompanyRequestDto, CreateCompanyDto } from '../../types/dashboard';
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
  const [pendingRequests, setPendingRequests] = useState<PendingCompanyRequestDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompaniesListDto | null>(null);

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
      const [compList, pendingList] = await Promise.all([
        adminService.getAllCompanies(),
        adminService.getPendingCompanyRequests(),
      ]);
      setCompanies(compList);
      setPendingRequests(pendingList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    if (!name.trim() || !address.trim()) {
      toast.error('Company name and address are required');
      return;
    }
    const dto: CreateCompanyDto = {
      name,
      contactEmail: contactEmail || undefined,
      address,
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
      console.error(err);
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
      toast.success(`Company "${targetApproveName}" approved successfully`);
      setApproveConfirmOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      toast.success('Company deleted');
      setDeleteConfirmOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<CompaniesListDto>[] = [
    {
      header: 'Company Name',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
          <p className="text-xs text-slate-400">{item.address}</p>
        </div>
      ),
    },
    {
      header: 'Address',
      cell: (item) => item.address || '-',
    },
    {
      header: 'Approval',
      cell: (item) => (
        <Badge variant={item.isApproved ? 'success' : 'warning'}>
          {item.isApproved ? 'Approved' : 'Pending Review'}
        </Badge>
      ),
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
          {!item.isApproved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenApproveConfirm(item.id, item.name)}
              title="Approve Company"
            >
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </Button>
          )}
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.companies')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage training provider companies and review registration requests
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Company
        </Button>
      </div>

      {pendingRequests.length > 0 && (
        <Card className="p-4 border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold">Pending Company Registration Requests ({pendingRequests.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{req.companyName}</p>
                  <p className="text-slate-400">{req.contactEmail || req.companyAddress}</p>
                </div>
                <Button size="sm" variant="success" onClick={() => handleOpenApproveConfirm(req.id, req.companyName)}>
                  Approve
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Table columns={columns} data={companies} keyExtractor={(item) => item.id} isLoading={loading} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCompany ? 'Edit Company' : 'Add New Company'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Company Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Contact Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@company.com" />
          <Input label="Company Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Headquarters Address" required />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Approve Company Registration"
        message={`Are you sure you want to approve company "${targetApproveName}" for student summer training programs?`}
        confirmText="Approve"
        variant="success"
        isLoading={submitting}
      />

      <ConfirmModal
        isOpen={toggleConfirmOpen}
        onClose={() => setToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={targetToggleCompany?.isActive ? 'Deactivate Company' : 'Activate Company'}
        message={`Are you sure you want to ${targetToggleCompany?.isActive ? 'deactivate' : 'activate'} "${targetToggleCompany?.name}"?`}
        confirmText={targetToggleCompany?.isActive ? 'Deactivate' : 'Activate'}
        variant={targetToggleCompany?.isActive ? 'danger' : 'success'}
        isLoading={submitting}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        message={`Are you sure you want to delete company "${targetDeleteName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};
