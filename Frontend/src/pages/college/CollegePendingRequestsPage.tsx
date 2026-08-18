import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Eye,
  UserCheck,
  Briefcase,
  GraduationCap,
  Clock,
  Search,
  Building2,
  Calendar,
  Info,
  FileText,
  Mail,
  Phone,
  User,
  School,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { collegeService } from '../../api/collegeService';
import { trainingService } from '../../api/trainingService';
import { reportsService } from '../../api/reportsService';
import {
  CollegeStudentsUpgradeRequestsListDto,
  UpgradeRequestDetailsDto,
  StudentProfileResponseDto,
} from '../../types/dashboard';
import { PendingTrainingRequestDto, MyTrainingRequestDto } from '../../types/training';
import { enRequestStatus } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { FileViewerModal } from '../../components/ui/FileViewerModal';

export const CollegePendingRequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<'student-upgrades' | 'training-requests'>('student-upgrades');
  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'handled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Student Upgrade Requests State
  const [pendingStudentUpgrades, setPendingStudentUpgrades] = useState<CollegeStudentsUpgradeRequestsListDto[]>([]);
  const [handledStudentUpgrades, setHandledStudentUpgrades] = useState<CollegeStudentsUpgradeRequestsListDto[]>([]);
  const [loadingUpgrades, setLoadingUpgrades] = useState(true);

  // Summer Training Requests State
  const [allTrainingRequests, setAllTrainingRequests] = useState<PendingTrainingRequestDto[]>([]);
  const [loadingTrainings, setLoadingTrainings] = useState(true);

  // Request Details Modal State
  const [selectedUpgradeDetails, setSelectedUpgradeDetails] = useState<UpgradeRequestDetailsDto | null>(null);
  const [upgradeDetailsModalOpen, setUpgradeDetailsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [selectedTrainingDetails, setSelectedTrainingDetails] = useState<MyTrainingRequestDto | null>(null);
  const [trainingDetailsModalOpen, setTrainingDetailsModalOpen] = useState(false);

  // Entity Details Pop-ups State
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfileResponseDto | null>(null);
  const [studentProfileModalOpen, setStudentProfileModalOpen] = useState(false);
  const [loadingStudentProfile, setLoadingStudentProfile] = useState(false);

  const [selectedCompanyInfo, setSelectedCompanyInfo] = useState<{
    name: string;
    studentName?: string;
    studentId?: string;
    trainingPeriod?: string;
    status?: enRequestStatus;
    acceptanceLetterPath?: string;
    address?: string;
    contactEmail?: string;
  } | null>(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);

  // Processing Modal State
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [isApprovedAction, setIsApprovedAction] = useState<boolean>(true);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Document Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingPublicId, setViewingPublicId] = useState<string | null>(null);
  const [viewingTitle, setViewingTitle] = useState<string>('Document Preview');
  const [viewerMode, setViewerMode] = useState<'proof' | 'training'>('proof');

  const fetchStudentUpgrades = async () => {
    try {
      setLoadingUpgrades(true);
      const [pendingRes, handledRes] = await Promise.all([
        collegeService.getPendingStudentRequests().catch(() => []),
        collegeService.getHandledStudentRequests().catch(() => []),
      ]);
      setPendingStudentUpgrades(pendingRes);
      setHandledStudentUpgrades(handledRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUpgrades(false);
    }
  };

  const fetchTrainingRequests = async () => {
    try {
      setLoadingTrainings(true);
      const res = await trainingService.getCollegePendingRequests();
      setAllTrainingRequests(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrainings(false);
    }
  };

  const refreshAll = () => {
    fetchStudentUpgrades();
    fetchTrainingRequests();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const isPendingStatus = (status?: enRequestStatus | string | number) => {
    return (
      status === enRequestStatus.Pending ||
      (status as any) === 1 ||
      String(status).toLowerCase() === 'pending'
    );
  };

  const isApprovedStatus = (status?: enRequestStatus | string | number) => {
    return (
      status === enRequestStatus.Approved ||
      (status as any) === 2 ||
      String(status).toLowerCase() === 'approved'
    );
  };

  const renderStatusBadge = (status?: enRequestStatus | string | number) => {
    if (isApprovedStatus(status)) {
      return <Badge variant="success">{t('common.approved', 'Approved')}</Badge>;
    }
    if (isPendingStatus(status)) {
      return <Badge variant="warning">{t('common.pending', 'Pending Review')}</Badge>;
    }
    return <Badge variant="danger">{t('common.rejected', 'Rejected')}</Badge>;
  };

  // Filtered Training Requests (Split into Pending and Handled)
  const pendingTrainingRequests = useMemo(() => {
    return allTrainingRequests.filter((r) => isPendingStatus(r.status));
  }, [allTrainingRequests]);

  const handledTrainingRequests = useMemo(() => {
    return allTrainingRequests.filter((r) => !isPendingStatus(r.status));
  }, [allTrainingRequests]);

  // Search Filters
  const filteredPendingUpgrades = useMemo(() => {
    if (!searchQuery.trim()) return pendingStudentUpgrades;
    const q = searchQuery.toLowerCase();
    return pendingStudentUpgrades.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.collegeName.toLowerCase().includes(q)
    );
  }, [pendingStudentUpgrades, searchQuery]);

  const filteredHandledUpgrades = useMemo(() => {
    if (!searchQuery.trim()) return handledStudentUpgrades;
    const q = searchQuery.toLowerCase();
    return handledStudentUpgrades.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.collegeName.toLowerCase().includes(q)
    );
  }, [handledStudentUpgrades, searchQuery]);

  const filteredPendingTrainings = useMemo(() => {
    if (!searchQuery.trim()) return pendingTrainingRequests;
    const q = searchQuery.toLowerCase();
    return pendingTrainingRequests.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.companyName && r.companyName.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
    );
  }, [pendingTrainingRequests, searchQuery]);

  const filteredHandledTrainings = useMemo(() => {
    if (!searchQuery.trim()) return handledTrainingRequests;
    const q = searchQuery.toLowerCase();
    return handledTrainingRequests.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.companyName && r.companyName.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
    );
  }, [handledTrainingRequests, searchQuery]);

  const handleOpenProcess = (requestId: string, approve: boolean) => {
    setSelectedRequestId(requestId);
    setIsApprovedAction(approve);
    setRejectionReason('');
    setProcessModalOpen(true);
  };

  const handleOpenProofViewer = (publicId: string, studentName: string) => {
    setViewingPublicId(publicId);
    setViewerMode('proof');
    setViewingTitle(`Proof_${studentName}`);
    setViewerOpen(true);
  };

  const handleOpenTrainingDocViewer = (requestId: string, studentName: string) => {
    setViewingPublicId(requestId);
    setViewerMode('training');
    setViewingTitle(`Acceptance_Letter_${studentName}`);
    setViewerOpen(true);
  };

  const handleViewUpgradeDetails = async (publicId: string) => {
    try {
      setLoadingDetails(true);
      const details = await collegeService.getStudentRequestDetails(publicId);
      setSelectedUpgradeDetails(details);
      setUpgradeDetailsModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewTrainingDetails = async (requestId: string, fallbackItem?: PendingTrainingRequestDto) => {
    try {
      setTrainingDetailsModalOpen(true);
      const details = await trainingService.getPendingRequest(requestId);
      setSelectedTrainingDetails(details);
    } catch (err) {
      console.error(err);
      if (fallbackItem) {
        setSelectedTrainingDetails({
          id: fallbackItem.id,
          requestPublicId: fallbackItem.id,
          studentName: fallbackItem.studentName,
          companyName: fallbackItem.companyName,
          startDate: fallbackItem.startDate,
          acceptanceLetterPath: fallbackItem.acceptanceLetterPath,
          status: fallbackItem.status,
        });
      }
    }
  };

  const handleOpenStudentProfileModal = async (studentPublicId?: string, fallbackName?: string) => {
    if (!studentPublicId) return;
    try {
      setLoadingStudentProfile(true);
      setStudentProfileModalOpen(true);
      const profile = await collegeService.getStudentProfile(studentPublicId);
      setSelectedStudentProfile(profile);
    } catch (err) {
      console.error(err);
      setSelectedStudentProfile({
        id: studentPublicId,
        name: fallbackName || 'Student',
        username: studentPublicId,
        collegeName: 'Enrolled College',
      });
    } finally {
      setLoadingStudentProfile(false);
    }
  };

  const handleOpenCompanyModal = (
    companyName?: string,
    req?: PendingTrainingRequestDto
  ) => {
    if (!companyName && !req) return;
    setSelectedCompanyInfo({
      name: companyName || req?.companyName || 'Target Company',
      studentName: req?.studentName,
      studentId: req?.studentId || req?.id || req?.requestPublicId,
      trainingPeriod: req?.startDate && req?.endDate ? `${req.startDate} → ${req.endDate}` : undefined,
      status: req?.status,
      acceptanceLetterPath: req?.acceptanceLetterPath,
    });
    setCompanyModalOpen(true);
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (activeCategory === 'student-upgrades') {
        await collegeService.handleStudentRequest(selectedRequestId, {
          isApproved: isApprovedAction,
          comment: !isApprovedAction ? rejectionReason : undefined,
        });
        toast.success(
          isApprovedAction
            ? t('common.approved', 'Student upgrade request approved')
            : t('common.rejected', 'Student upgrade request rejected')
        );
        setProcessModalOpen(false);
        setUpgradeDetailsModalOpen(false);
        fetchStudentUpgrades();
      } else {
        await trainingService.processRequest({
          requestPublicId: selectedRequestId,
          isApproved: isApprovedAction,
          rejectionReason: !isApprovedAction ? rejectionReason : undefined,
        });
        toast.success(
          isApprovedAction
            ? t('common.approved', 'Training request approved')
            : t('common.rejected', 'Training request rejected')
        );
        setProcessModalOpen(false);
        setTrainingDetailsModalOpen(false);
        fetchTrainingRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Pending Student Upgrade Columns
  const pendingUpgradeColumns: Column<CollegeStudentsUpgradeRequestsListDto>[] = [
    {
      header: t('college.studentName', 'Student Name'),
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleViewUpgradeDetails(item.publicId);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view details"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.studentName}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">ID: {item.studentId}</p>
          </div>
        </div>
      ),
    },
    {
      header: t('admin.requestedRoleCol', 'Requested Role'),
      cell: (item) => <Badge variant="indigo">{item.requestedRole || t('roles.student', 'Student')}</Badge>,
    },
    {
      header: t('auth.college', 'College'),
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <School className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.collegeName || '-'}</span>
        </div>
      ),
    },
    {
      header: t('college.proofDocument', 'Proof File'),
      cell: (item) =>
        item.filePath ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProofViewer(item.publicId, item.studentName);
            }}
            leftIcon={<Eye className="w-4 h-4 text-indigo-500" />}
          >
            {t('college.previewDoc', 'View Proof')}
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">{t('admin.noAttachment', 'None')}</span>
        ),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUpgradeDetails(item.publicId)}
            leftIcon={<Info className="w-4 h-4 text-slate-500" />}
          >
            {t('college.detailsBtn', 'Details')}
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProcess(item.publicId, true);
            }}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {t('college.approveBtn', 'Approve')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProcess(item.publicId, false);
            }}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            {t('college.rejectBtn', 'Reject')}
          </Button>
        </div>
      ),
    },
  ];

  // Handled Student Upgrade Columns
  const handledUpgradeColumns: Column<CollegeStudentsUpgradeRequestsListDto>[] = [
    {
      header: t('college.studentName', 'Student Name'),
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleViewUpgradeDetails(item.publicId);
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.studentName}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">ID: {item.studentId}</p>
          </div>
        </div>
      ),
    },
    {
      header: t('admin.requestedRoleCol', 'Role'),
      cell: (item) => <Badge variant="indigo">{item.requestedRole || t('roles.student', 'Student')}</Badge>,
    },
    {
      header: t('common.status', 'Status'),
      cell: (item) => renderStatusBadge(item.status),
    },
    {
      header: t('college.proofDocument', 'Proof File'),
      cell: (item) =>
        item.filePath ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProofViewer(item.publicId, item.studentName);
            }}
            leftIcon={<Eye className="w-4 h-4 text-indigo-500" />}
          >
            {t('college.previewDoc', 'View File')}
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">{t('admin.noAttachment', 'None')}</span>
        ),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewUpgradeDetails(item.publicId)}
          leftIcon={<Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
        >
          {t('college.detailsBtn', 'View Details')}
        </Button>
      ),
    },
  ];

  // Pending Summer Training Columns
  const pendingTrainingColumns: Column<PendingTrainingRequestDto>[] = [
    {
      header: t('college.studentName', 'Student Name'),
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStudentProfileModal(item.id, item.studentName);
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Click to view student profile"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-3.5 h-3.5" />}
          </div>
          <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.studentName}
          </p>
        </div>
      ),
    },
    {
      header: t('college.targetCompany', 'Target Company'),
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenCompanyModal(item.companyName, item);
          }}
          className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          title="Click to view company details"
        >
          <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
          <span className="font-medium">{item.companyName || '-'}</span>
        </div>
      ),
    },
    {
      header: t('college.startDate', 'Start Date'),
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.startDate || '-'}</span>
        </div>
      ),
    },
    {
      header: t('college.acceptanceLetter', 'Acceptance Letter'),
      cell: (item) =>
        item.acceptanceLetterPath ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenTrainingDocViewer(item.id, item.studentName);
            }}
            leftIcon={<Eye className="w-4 h-4 text-indigo-500" />}
          >
            {t('college.previewDoc', 'View Letter')}
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">{t('admin.noAttachment', 'None')}</span>
        ),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewTrainingDetails(item.id, item)}
            leftIcon={<Info className="w-4 h-4 text-slate-500" />}
          >
            {t('college.detailsBtn', 'Details')}
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProcess(item.id, true);
            }}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {t('college.approveBtn', 'Approve')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProcess(item.id, false);
            }}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            {t('college.rejectBtn', 'Reject')}
          </Button>
        </div>
      ),
    },
  ];

  // Handled Summer Training Columns
  const handledTrainingColumns: Column<PendingTrainingRequestDto>[] = [
    {
      header: t('college.studentName', 'Student Name'),
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStudentProfileModal(item.id, item.studentName);
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-3.5 h-3.5" />}
          </div>
          <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.studentName}
          </p>
        </div>
      ),
    },
    {
      header: t('college.targetCompany', 'Target Company'),
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenCompanyModal(item.companyName, item);
          }}
          className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">{item.companyName || '-'}</span>
        </div>
      ),
    },
    {
      header: t('common.status', 'Status'),
      cell: (item) => renderStatusBadge(item.status),
    },
    {
      header: t('college.acceptanceLetter', 'Acceptance Letter'),
      cell: (item) =>
        item.acceptanceLetterPath ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenTrainingDocViewer(item.id, item.studentName);
            }}
            leftIcon={<Eye className="w-4 h-4 text-indigo-500" />}
          >
            {t('college.previewDoc', 'View Letter')}
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">{t('admin.noAttachment', 'None')}</span>
        ),
    },
    {
      header: t('common.actions', 'Actions'),
      cell: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewTrainingDetails(item.id, item)}
          leftIcon={<Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
        >
          {t('college.detailsBtn', 'View Details')}
        </Button>
      ),
    },
  ];

  const totalActionNeeded = pendingStudentUpgrades.length + pendingTrainingRequests.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('college.requestsTitle', 'Requests & Approvals Management Hub')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('college.requestsSubtitle', 'Review student upgrade applications and summer training placements, and inspect handled history')}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          isLoading={loadingUpgrades || loadingTrainings}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${(loadingUpgrades || loadingTrainings) ? 'animate-spin' : ''}`} />}
        >
          {t('common.refresh', 'Refresh')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('admin.pendingReview', 'Pending Approvals')}</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalActionNeeded}</span>
            <span className="text-xs text-slate-400">{t('admin.actionRequired', 'awaiting review')}</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-sky-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-sky-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('college.studentRegistrationsTab', 'Student Registrations')}</span>
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{pendingStudentUpgrades.length}</span>
            <span className="text-xs text-sky-600 font-medium">
              / {pendingStudentUpgrades.length + handledStudentUpgrades.length} total
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-amber-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('college.trainingRequestsTab', 'Training Applications')}</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{pendingTrainingRequests.length}</span>
            <span className="text-xs text-amber-600 font-medium">
              / {allTrainingRequests.length} total
            </span>
          </div>
        </Card>
      </div>

      {/* Main Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveCategory('student-upgrades')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeCategory === 'student-upgrades'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{t('college.studentRegistrationsTab', 'Student Registration Requests')}</span>
          {pendingStudentUpgrades.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              {pendingStudentUpgrades.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveCategory('training-requests')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeCategory === 'training-requests'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t('college.trainingRequestsTab', 'Summer Training Requests')}</span>
          {pendingTrainingRequests.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              {pendingTrainingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Sub-Tabs: Pending vs Handled & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setActiveStatusTab('pending')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeStatusTab === 'pending'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('college.pendingSubTab', 'Pending Review')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px]">
              {activeCategory === 'student-upgrades'
                ? pendingStudentUpgrades.length
                : pendingTrainingRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusTab('handled')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeStatusTab === 'handled'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t('college.handledSubTab', 'Handled History')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
              {activeCategory === 'student-upgrades'
                ? handledStudentUpgrades.length
                : handledTrainingRequests.length}
            </span>
          </button>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder={t('admin.searchUpgradesPlaceholder', 'Search by student name, ID, or company...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Table Section */}
      {activeCategory === 'student-upgrades' ? (
        activeStatusTab === 'pending' ? (
          <Table
            columns={pendingUpgradeColumns}
            data={filteredPendingUpgrades}
            keyExtractor={(r) => r.publicId}
            isLoading={loadingUpgrades}
            emptyMessage={
              searchQuery
                ? t('common.noData', 'No matching student upgrade requests found.')
                : t('admin.allQueuesUpToDate', 'No pending student upgrade requests to review.')
            }
          />
        ) : (
          <Table
            columns={handledUpgradeColumns}
            data={filteredHandledUpgrades}
            keyExtractor={(r) => r.publicId}
            isLoading={loadingUpgrades}
            emptyMessage={
              searchQuery
                ? t('common.noData', 'No matching handled student upgrade records found.')
                : t('common.noData', 'No handled student registration requests yet.')
            }
          />
        )
      ) : activeStatusTab === 'pending' ? (
        <Table
          columns={pendingTrainingColumns}
          data={filteredPendingTrainings}
          keyExtractor={(r) => r.id}
          isLoading={loadingTrainings}
          emptyMessage={
            searchQuery
              ? t('common.noData', 'No matching summer training requests found.')
              : t('admin.allQueuesUpToDate', 'No pending summer training requests to review.')
          }
        />
      ) : (
        <Table
          columns={handledTrainingColumns}
          data={filteredHandledTrainings}
          keyExtractor={(r) => r.id}
          isLoading={loadingTrainings}
          emptyMessage={
            searchQuery
              ? t('common.noData', 'No matching handled training records found.')
              : t('common.noData', 'No handled training requests yet.')
          }
        />
      )}

      {/* Student Upgrade Details Modal */}
      <Modal
        isOpen={upgradeDetailsModalOpen}
        onClose={() => setUpgradeDetailsModalOpen(false)}
        title={t('admin.applicationDetailsTitle', 'Student Upgrade Application Details')}
        maxWidth="lg"
      >
        {loadingDetails ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading details...</div>
        ) : selectedUpgradeDetails ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">{t('college.studentName', 'Student Name')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedUpgradeDetails.userName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">{t('admin.requestedRoleCol', 'Requested Role')}</p>
                  <Badge variant="indigo">{selectedUpgradeDetails.requestedRole}</Badge>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">{t('auth.college', 'College')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedUpgradeDetails.collegeName || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">{t('admin.officialEmail', 'Official Email')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedUpgradeDetails.officialEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">{t('admin.submissionDate', 'Submission Date')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedUpgradeDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">{t('common.status', 'Status')}</p>
                  {renderStatusBadge(selectedUpgradeDetails.status)}
                </div>
              </div>
            </div>

            {selectedUpgradeDetails.proofFilePath && (
              <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                  {t('college.proofDocument', 'Student ID / Enrollment Proof Document Attached')}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenProofViewer(selectedUpgradeDetails.id, selectedUpgradeDetails.userName)}
                  leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
                >
                  {t('college.previewDoc', 'View Document')}
                </Button>
              </div>
            )}

            {isPendingStatus(selectedUpgradeDetails.status) && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="danger"
                  onClick={() => handleOpenProcess(selectedUpgradeDetails.id, false)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  {t('college.rejectBtn', 'Reject')}
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleOpenProcess(selectedUpgradeDetails.id, true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {t('college.approveBtn', 'Approve')}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Summer Training Details Modal */}
      <Modal
        isOpen={trainingDetailsModalOpen}
        onClose={() => setTrainingDetailsModalOpen(false)}
        title={t('college.requestsTitle', 'Summer Training Application Details')}
        maxWidth="lg"
      >
        {selectedTrainingDetails ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">{t('college.studentName', 'Student Name')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedTrainingDetails.studentName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">{t('college.targetCompany', 'Target Company')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedTrainingDetails.companyName || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">{t('college.startDate', 'Start Date')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedTrainingDetails.startDate || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">{t('common.status', 'Status')}</p>
                  {renderStatusBadge(selectedTrainingDetails.status)}
                </div>
              </div>
            </div>

            {selectedTrainingDetails.acceptanceLetterPath && (
              <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                  {t('college.acceptanceLetter', 'Official Company Acceptance Letter Attached')}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenTrainingDocViewer(selectedTrainingDetails.id || selectedTrainingDetails.requestPublicId!, selectedTrainingDetails.studentName || 'Student')}
                  leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
                >
                  {t('college.previewDoc', 'View Letter')}
                </Button>
              </div>
            )}

            {isPendingStatus(selectedTrainingDetails.status) && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="danger"
                  onClick={() => handleOpenProcess(selectedTrainingDetails.id || selectedTrainingDetails.requestPublicId!, false)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  {t('college.rejectBtn', 'Reject')}
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleOpenProcess(selectedTrainingDetails.id || selectedTrainingDetails.requestPublicId!, true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {t('college.approveBtn', 'Approve')}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Student Profile Pop-up Modal */}
      <Modal
        isOpen={studentProfileModalOpen}
        onClose={() => setStudentProfileModalOpen(false)}
        title={t('college.studentProfileTitle', 'Student Profile & Academic Information')}
      >
        {loadingStudentProfile ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading student profile...</div>
        ) : selectedStudentProfile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base shrink-0">
                {selectedStudentProfile.name ? selectedStudentProfile.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white text-base leading-tight truncate">
                  {selectedStudentProfile.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  ID: {selectedStudentProfile.universityIdNumber || selectedStudentProfile.id}
                </p>
              </div>
              {selectedStudentProfile.gpa !== undefined && selectedStudentProfile.gpa !== null && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">{t('college.gpa', 'GPA')}</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {Number(selectedStudentProfile.gpa).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> {t('college.studentId', 'University ID')}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono block">
                  {selectedStudentProfile.universityIdNumber || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> {t('college.major', 'Major')}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.major || 'Undergraduate'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {t('admin.officialEmail', 'Official Email')}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.email || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {t('profile.phoneNumber', 'Phone Number')}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.phoneNumber || '-'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setStudentProfileModalOpen(false)}>
                {t('common.close', 'Close')}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Company Info Modal */}
      <Modal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        title={t('admin.companiesTitle', 'Company Information')}
      >
        {selectedCompanyInfo ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">
                  {selectedCompanyInfo.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('admin.accreditedBadge', 'Accredited Training Partner')}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setCompanyModalOpen(false)}>
                {t('common.close', 'Close')}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Unified Processing Modal (Approve / Reject with comment) */}
      <Modal
        isOpen={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        title={isApprovedAction ? t('college.approveAction', 'Approve Request') : t('college.rejectAction', 'Reject Request')}
      >
        <form onSubmit={handleProcessSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isApprovedAction
              ? 'Are you sure you want to approve this application? The student will be officially notified.'
              : 'Please provide a clear reason for rejecting this application. The feedback will be shared with the student.'}
          </p>

          {!isApprovedAction && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('college.rejectionReasonLabel', 'Rejection Reason & Academic Feedback *')}
              </label>
              <textarea
                rows={3}
                placeholder={t('college.rejectionReasonPlaceholder', 'Explain reasons for rejection...')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setProcessModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              variant={isApprovedAction ? 'success' : 'danger'}
              isLoading={submitting}
            >
              {isApprovedAction ? t('college.approveBtn', 'Confirm Approval') : t('college.rejectBtn', 'Confirm Rejection')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* File Viewer Modal */}
      {viewerOpen && viewingPublicId && (
        <FileViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setViewingPublicId(null);
          }}
          title={t('college.previewDoc', 'Document Preview')}
          fileName={viewingTitle}
          fetchBlob={() =>
            viewerMode === 'proof'
              ? collegeService.getProofFileBlob(viewingPublicId)
              : reportsService.downloadAttachmentBlob(viewingPublicId)
          }
        />
      )}
    </div>
  );
};
