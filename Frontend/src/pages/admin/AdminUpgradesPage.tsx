import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Download, FileText } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { UpgradeRequestsListDto, UpgradeRequestDetailsDto } from '../../types/dashboard';
import { enRequestStatus } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { FileViewerModal } from '../../components/ui/FileViewerModal';

export const AdminUpgradesPage: React.FC = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<UpgradeRequestsListDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Request Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<UpgradeRequestDetailsDto | null>(null);

  // File Viewer Modal State
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [viewingProofId, setViewingProofId] = useState<string | null>(null);
  const [viewingProofName, setViewingProofName] = useState<string>('Proof Document');

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  // Approve Confirm Modal
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<UpgradeRequestsListDto | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPendingUpgradeRequests();
      setRequests(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewDetails = async (publicId: string) => {
    try {
      const details = await adminService.getUpgradeRequestById(publicId);
      setSelectedDetails(details);
      setDetailsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenProofViewer = (publicId: string, userName: string) => {
    setViewingProofId(publicId);
    setViewingProofName(`Proof_${userName}`);
    setFileViewerOpen(true);
  };

  const handleOpenApproveConfirm = (item: UpgradeRequestsListDto) => {
    setApproveTarget(item);
    setApproveConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    try {
      setSubmitting(true);
      await adminService.approveUpgradeRequest(approveTarget.id);
      toast.success(`Role upgrade approved for ${approveTarget.userName}`);
      setApproveConfirmOpen(false);
      setDetailsModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRejectModal = (publicId: string) => {
    setRejectTargetId(publicId);
    setComment('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTargetId) return;
    try {
      setSubmitting(true);
      await adminService.rejectUpgradeRequest(rejectTargetId, { isApproved: false, comment });
      toast.success('Upgrade request rejected');
      setRejectModalOpen(false);
      setDetailsModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isPendingStatus = (status: any) => {
    return status === enRequestStatus.Pending || status === 1 || String(status).toLowerCase() === 'pending';
  };

  const columns: Column<UpgradeRequestsListDto>[] = [
    {
      header: 'User Name',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.userName}</p>
        </div>
      ),
    },
    {
      header: 'Requested Role',
      cell: (item) => <Badge variant="indigo">{item.requestedRole}</Badge>,
    },
    {
      header: 'Target Entity',
      cell: (item) => item.collegeName || item.companyName || '-',
    },
    {
      header: 'Proof File',
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenProofViewer(item.id, item.userName)}
          leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
        >
          View Proof Document
        </Button>
      ),
    },
    {
      header: t('common.status'),
      cell: (item) => {
        const statusVal = String(item.status);
        const variantMap: Record<string, 'warning' | 'success' | 'danger' | 'neutral'> = {
          [enRequestStatus.Pending]: 'warning',
          [enRequestStatus.Approved]: 'success',
          [enRequestStatus.Rejected]: 'danger',
          [enRequestStatus.Deleted]: 'neutral',
          '1': 'warning',
          '2': 'success',
          '3': 'danger',
          '4': 'neutral',
        };
        const labelMap: Record<string, string> = {
          [enRequestStatus.Pending]: 'Pending Review',
          [enRequestStatus.Approved]: 'Approved',
          [enRequestStatus.Rejected]: 'Rejected',
          [enRequestStatus.Deleted]: 'Canceled',
          '1': 'Pending Review',
          '2': 'Approved',
          '3': 'Rejected',
          '4': 'Canceled',
        };
        return <Badge variant={variantMap[statusVal] ?? 'neutral'}>{labelMap[statusVal] ?? statusVal}</Badge>;
      },
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(item.id)}
            title="View Request Details"
          >
            <Eye className="w-4 h-4 text-slate-500 hover:text-indigo-600" />
          </Button>

          {isPendingStatus(item.status) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenApproveConfirm(item)}
                title="Approve Request"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenRejectModal(item.id)}
                title="Reject Request"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Role Upgrade Requests</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review official proof documents in large pop-up window and approve/reject user role upgrade requests
        </p>
      </div>

      <Table columns={columns} data={requests} keyExtractor={(item) => item.id} isLoading={loading} />

      {/* Full Request Details Modal */}
      <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Role Upgrade Request Details" maxWidth="4xl">
        {selectedDetails && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Applicant Name</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedDetails.userName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Requested Role</p>
                  <Badge variant="indigo">{selectedDetails.requestedRole}</Badge>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Status</p>
                  <Badge
                    variant={
                      selectedDetails.status === enRequestStatus.Approved || (selectedDetails.status as any) === 2 || String(selectedDetails.status).toLowerCase() === 'approved'
                        ? 'success'
                        : selectedDetails.status === enRequestStatus.Rejected || (selectedDetails.status as any) === 3 || String(selectedDetails.status).toLowerCase() === 'rejected'
                        ? 'danger'
                        : isPendingStatus(selectedDetails.status)
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {selectedDetails.status === enRequestStatus.Approved || (selectedDetails.status as any) === 2 || String(selectedDetails.status).toLowerCase() === 'approved'
                      ? 'Approved'
                      : selectedDetails.status === enRequestStatus.Rejected || (selectedDetails.status as any) === 3 || String(selectedDetails.status).toLowerCase() === 'rejected'
                      ? 'Rejected'
                      : isPendingStatus(selectedDetails.status)
                      ? 'Pending Review'
                      : String(selectedDetails.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Official Email</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedDetails.officialEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Submission Date</p>
                  <p className="font-semibold">{new Date(selectedDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">College Affiliation</p>
                  <p className="font-semibold">{selectedDetails.collegeName || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Company Affiliation</p>
                  <p className="font-semibold">{selectedDetails.companyName || '-'}</p>
                </div>
                {selectedDetails.reviewedByName && (
                  <div>
                    <p className="text-slate-400 font-medium">Reviewed By</p>
                    <p className="font-semibold">{selectedDetails.reviewedByName}</p>
                  </div>
                )}
                {selectedDetails.reviewedAt && (
                  <div>
                    <p className="text-slate-400 font-medium">Reviewed Date</p>
                    <p className="font-semibold">{new Date(selectedDetails.reviewedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedDetails.comment && (
              <div className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 space-y-1">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Reviewer Feedback / Note
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-400">{selectedDetails.comment}</p>
              </div>
            )}

            <div className="p-3.5 rounded-xl border border-indigo-200/60 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 dark:text-white">Official Proof Document Attached</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenProofViewer(selectedDetails.id, selectedDetails.userName)}
                leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
              >
                View Proof in Large Popup
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
              {isPendingStatus(selectedDetails.status) && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => handleOpenRejectModal(selectedDetails.id)}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Reject Request
                  </Button>
                  <Button
                    variant="success"
                    onClick={() =>
                      handleOpenApproveConfirm({
                        id: selectedDetails.id,
                        userName: selectedDetails.userName,
                        requestedRole: selectedDetails.requestedRole,
                        proofFilePath: selectedDetails.proofFilePath,
                        status: enRequestStatus.Pending,
                      })
                    }
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Approve Upgrade
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Proof File Large Viewer Modal */}
      {viewingProofId && (
        <FileViewerModal
          isOpen={fileViewerOpen}
          onClose={() => {
            setFileViewerOpen(false);
            setViewingProofId(null);
          }}
          title="Official Proof Document Preview"
          fileName={viewingProofName}
          fetchBlob={() => adminService.getProofFileBlob(viewingProofId)}
        />
      )}

      <ConfirmModal
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Approve Role Upgrade"
        message={`Are you sure you want to approve role upgrade to "${approveTarget?.requestedRole}" for user "${approveTarget?.userName}"?`}
        confirmText="Approve Upgrade"
        variant="success"
        isLoading={submitting}
      />

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Upgrade Request">
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <Input
            label="Rejection Comment / Reason"
            placeholder="Explain why the proof file or request was rejected..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={submitting}>
              Reject Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
