import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Search,
  RefreshCw,
  Clock,
  School,
  Building2,
  Calendar,
  User,
  MessageSquare,
  Trash2,
  Mail,
  AlertCircle,
} from 'lucide-react';
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
import { Card } from '../../components/ui/Card';

export const AdminUpgradesPage: React.FC = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<UpgradeRequestsListDto[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<UpgradeRequestsListDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'deleted'>('all');

  // Request Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<UpgradeRequestDetailsDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      setFilteredRequests(res);
    } catch (err) {
      console.error('Failed to load upgrade requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const isPendingStatus = (status: any) => {
    return (
      status === enRequestStatus.Pending ||
      status === 1 ||
      status === '1' ||
      String(status).toLowerCase() === 'pending'
    );
  };

  const isApprovedStatus = (status: any) => {
    return (
      status === enRequestStatus.Approved ||
      status === 2 ||
      status === '2' ||
      String(status).toLowerCase() === 'approved'
    );
  };

  const isRejectedStatus = (status: any) => {
    return (
      status === enRequestStatus.Rejected ||
      status === 3 ||
      status === '3' ||
      String(status).toLowerCase() === 'rejected'
    );
  };

  const isDeletedStatus = (status: any) => {
    return (
      status === enRequestStatus.Deleted ||
      status === 4 ||
      status === '4' ||
      String(status).toLowerCase() === 'deleted' ||
      String(status).toLowerCase() === 'canceled' ||
      String(status).toLowerCase() === 'cancelled'
    );
  };

  useEffect(() => {
    let result = [...requests];

    if (statusTab === 'pending') {
      result = result.filter((r) => isPendingStatus(r.status));
    } else if (statusTab === 'approved') {
      result = result.filter((r) => isApprovedStatus(r.status));
    } else if (statusTab === 'rejected') {
      result = result.filter((r) => isRejectedStatus(r.status));
    } else if (statusTab === 'deleted') {
      result = result.filter((r) => isDeletedStatus(r.status));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.collegeName?.toLowerCase().includes(q) ||
          r.companyName?.toLowerCase().includes(q) ||
          r.requestedRole.toLowerCase().includes(q)
      );
    }

    setFilteredRequests(result);
  }, [searchQuery, statusTab, requests]);

  // Statistics
  const totalRequests = requests.length;
  const pendingCount = requests.filter((r) => isPendingStatus(r.status)).length;
  const approvedCount = requests.filter((r) => isApprovedStatus(r.status)).length;
  const rejectedCount = requests.filter((r) => isRejectedStatus(r.status)).length;
  const deletedCount = requests.filter((r) => isDeletedStatus(r.status)).length;

  const handleViewDetails = async (publicId: string) => {
    try {
      setLoadingDetails(true);
      setDetailsModalOpen(true);
      const details = await adminService.getUpgradeRequestById(publicId);
      setSelectedDetails(details);
    } catch (err) {
      console.error('Failed to get upgrade request details:', err);
      toast.error('Failed to load request details');
    } finally {
      setLoadingDetails(false);
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
      console.error('Failed to approve upgrade request:', err);
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
    if (!comment.trim()) {
      toast.error('Please specify a rejection reason for the applicant');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.rejectUpgradeRequest(rejectTargetId, { isApproved: false, comment: comment.trim() });
      toast.success('Upgrade request rejected');
      setRejectModalOpen(false);
      setDetailsModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Failed to reject upgrade request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: any) => {
    if (isApprovedStatus(status)) {
      return (
        <Badge variant="success" size="sm">
          <CheckCircle className="w-3 h-3 mr-1" /> {t('common.approved', 'Approved')}
        </Badge>
      );
    }
    if (isRejectedStatus(status)) {
      return (
        <Badge variant="danger" size="sm">
          <XCircle className="w-3 h-3 mr-1" /> {t('common.rejected', 'Rejected')}
        </Badge>
      );
    }
    if (isDeletedStatus(status)) {
      return (
        <Badge variant="neutral" size="sm">
          <Trash2 className="w-3 h-3 mr-1" /> {t('admin.deletedByUser', 'Deleted by User')}
        </Badge>
      );
    }
    if (isPendingStatus(status)) {
      return (
        <Badge variant="warning" size="sm">
          <Clock className="w-3 h-3 mr-1" /> {t('common.pending', 'Pending Review')}
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm">
        {String(status)}
      </Badge>
    );
  };

  const columns: Column<UpgradeRequestsListDto>[] = [
    {
      header: t('admin.applicantInfoCol', 'Applicant Information'),
      cell: (item) => {
        const initials = item.userName ? item.userName.charAt(0).toUpperCase() : 'U';
        const isDel = isDeletedStatus(item.status);
        const isRej = isRejectedStatus(item.status);
        const isApp = isApprovedStatus(item.status);

        const avatarBg = isDel
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          : isRej
          ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
          : isApp
          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
          : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400';

        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${avatarBg}`}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className={`font-bold truncate ${isDel ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                {item.userName}
              </p>
              {item.createdAt && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: t('admin.requestedRoleCol', 'Requested Role'),
      cell: (item) => {
        const roleStr = item.requestedRole.toLowerCase();
        return (
          <Badge variant={roleStr.includes('college') ? 'indigo' : roleStr.includes('company') ? 'success' : 'info'} size="sm">
            {item.requestedRole}
          </Badge>
        );
      },
    },
    {
      header: t('admin.affiliationTargetCol', 'Affiliation Target'),
      cell: (item) => {
        if (item.collegeName) {
          return (
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-xs truncate">
              <School className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{item.collegeName}</span>
            </span>
          );
        }
        if (item.companyName) {
          return (
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-xs truncate">
              <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{item.companyName}</span>
            </span>
          );
        }
        return <span className="text-slate-400 text-xs">-</span>;
      },
    },
    {
      header: t('admin.verificationDocCol', 'Verification Document'),
      cell: (item) =>
        item.filePath ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProofViewer(item.id, item.userName);
            }}
            leftIcon={<FileText className="w-3.5 h-3.5 text-indigo-500" />}
            className="text-xs"
          >
            {t('admin.viewDocBtn', 'View Document')}
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">{t('admin.noAttachment', 'No attachment')}</span>
        ),
    },
    {
      header: t('admin.reviewStatusCol', 'Review Status'),
      cell: (item) => getStatusBadge(item.status),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(item.id)}
            title={t('admin.inspectRequest', 'Inspect Request Details')}
          >
            <Eye className="w-4 h-4 text-slate-500 hover:text-indigo-600" />
          </Button>

          {isPendingStatus(item.status) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenApproveConfirm(item)}
                title={t('admin.approveRoleUpgrade', 'Approve Role Upgrade')}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 hover:text-emerald-700" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenRejectModal(item.id)}
                title={t('admin.rejectRequest', 'Reject Request')}
              >
                <XCircle className="w-4 h-4 text-rose-500 hover:text-rose-600" />
              </Button>
            </>
          )}
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
            {t('admin.upgradesTitle', 'Role Upgrade Applications & Verification')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('admin.upgradesSubtitle', 'Review official letters, authorization credentials, and process university / corporate representative access requests')}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
          isLoading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          {t('common.refresh', 'Refresh Data')}
        </Button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-400">{t('admin.totalApplications', 'Total Applications')}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalRequests}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-amber-500">{t('admin.pendingReview', 'Pending Review')}</p>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-emerald-500">{t('admin.approvedUpgrades', 'Approved Upgrades')}</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{approvedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-rose-500">{t('admin.rejectedRequests', 'Rejected Requests')}</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{rejectedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('admin.deletedByUser', 'Deleted by User')}</p>
          <p className="text-2xl font-extrabold text-slate-600 dark:text-slate-300 mt-1">{deletedCount}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder={t('admin.searchUpgradesPlaceholder', 'Search applicant name, college, or company...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 overflow-x-auto pb-1 text-xs">
          {[
            { key: 'all', label: t('admin.allRequests', 'All Requests'), count: totalRequests },
            { key: 'pending', label: t('admin.pendingTab', 'Pending Review'), count: pendingCount },
            { key: 'approved', label: t('admin.approvedTab', 'Approved'), count: approvedCount },
            { key: 'rejected', label: t('admin.rejectedTab', 'Rejected'), count: rejectedCount },
            { key: 'deleted', label: t('admin.deletedTab', 'Deleted / Canceled'), count: deletedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                statusTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Requests Table */}
      <Table
        columns={columns}
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        isLoading={loading}
        onRowClick={(item) => handleViewDetails(item.id)}
        emptyMessage={
          searchQuery || statusTab !== 'all'
            ? t('common.noData', 'No upgrade requests matching your filter criteria.')
            : t('common.noData', 'No upgrade requests recorded in the system.')
        }
      />

      {/* Full Request Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={t('admin.applicationDetailsTitle', 'Role Upgrade Application Details')}
        maxWidth="2xl"
      >
        {loadingDetails ? (
          <div className="py-8 text-center text-slate-400 text-xs">{t('common.loading', 'Loading request details...')}</div>
        ) : selectedDetails ? (
          <div className="space-y-4">
            {/* Top Applicant Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                    {selectedDetails.userName ? selectedDetails.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {selectedDetails.userName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedDetails.officialEmail || selectedDetails.userEmail || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="indigo">{selectedDetails.requestedRole}</Badge>
                  {getStatusBadge(selectedDetails.status)}
                </div>
              </div>

              {/* Informational Grid with Harmonious Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                  <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {t('admin.submissionDate', 'Submission Date')}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {new Date(selectedDetails.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                  <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" /> {t('admin.targetAffiliation', 'Target Affiliation')}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                    {selectedDetails.collegeName || selectedDetails.companyName || '-'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                  <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500" /> {t('admin.officialEmail', 'Official Work / Academic Email')}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                    {selectedDetails.officialEmail || '-'}
                  </span>
                </div>

                {selectedDetails.userEmail && selectedDetails.userEmail !== selectedDetails.officialEmail && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                    <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-500" /> {t('admin.accountPrimaryEmail', 'Account Primary Email')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                      {selectedDetails.userEmail}
                    </span>
                  </div>
                )}

                {selectedDetails.reviewedByName && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                    <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-500" /> {t('admin.reviewedBy', 'Reviewed By')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedDetails.reviewedByName}
                    </span>
                  </div>
                )}

                {selectedDetails.reviewedAt && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                    <span className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> {t('admin.reviewedDate', 'Reviewed Date')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {new Date(selectedDetails.reviewedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Deleted Notice */}
            {isDeletedStatus(selectedDetails.status) && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">{t('admin.deletedTab', 'Request Cancelled / Deleted:')}</span>
                  <span>{t('admin.requestDeletedNotice', 'This role upgrade request was deleted by the applicant prior to evaluation. No administrative actions are required.')}</span>
                </div>
              </div>
            )}

            {/* Reviewer Feedback / Reason */}
            {selectedDetails.comment && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                  isRejectedStatus(selectedDetails.status)
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">{t('admin.reviewerFeedback', 'Reviewer Feedback:')}</span>
                  <span>{selectedDetails.comment}</span>
                </div>
              </div>
            )}

            {/* Verification Document Attached */}
            {selectedDetails.proofFilePath && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">{t('admin.docAttached', 'Official Authorization Document Attached')}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenProofViewer(selectedDetails.id, selectedDetails.userName)}
                  leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
                >
                  {t('admin.previewDoc', 'Preview Document')}
                </Button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setDetailsModalOpen(false)}>
                {t('common.close', 'Close')}
              </Button>
              {isPendingStatus(selectedDetails.status) && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => handleOpenRejectModal(selectedDetails.id)}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    {t('admin.rejectApplicationBtn', 'Reject Request')}
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
                    {t('admin.approveUpgradeBtn', 'Approve Upgrade')}
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Proof File Large Viewer Modal */}
      {viewingProofId && (
        <FileViewerModal
          isOpen={fileViewerOpen}
          onClose={() => {
            setFileViewerOpen(false);
            setViewingProofId(null);
          }}
          title={t('admin.docAttached', 'Official Proof Document Preview')}
          fileName={viewingProofName}
          fetchBlob={() => adminService.getProofFileBlob(viewingProofId)}
        />
      )}

      {/* Approve Confirm Modal */}
      <ConfirmModal
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title={t('admin.approveRoleUpgrade', 'Approve Role Upgrade Application')}
        message={`Are you sure you want to approve role upgrade to "${approveTarget?.requestedRole}" for user "${approveTarget?.userName}"? This will grant the user full representative permissions.`}
        confirmText={t('admin.approveUpgradeBtn', 'Approve Upgrade')}
        variant="success"
        isLoading={submitting}
      />

      {/* Reject Modal with Comment */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title={t('admin.rejectRequest', 'Reject Role Upgrade Application')}>
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <Input
            label={t('admin.rejectionReasonLabel', 'Rejection Reason / Note *')}
            placeholder={t('admin.rejectionReasonPlaceholder', 'Explain why the proof file or application was rejected...')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            helperText={t('admin.rejectionReasonPlaceholder', 'This reason will be recorded and communicated to the applicant.')}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="danger" isLoading={submitting}>
              {t('admin.rejectApplicationBtn', 'Reject Application')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
