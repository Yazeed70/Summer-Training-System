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
  CheckCheck,
  Search,
  Building2,
  Calendar,
  Info,
  FileText,
  Mail,
  Phone,
  User,
  School,
  ExternalLink,
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
import { enRequestStatus, enTrainingStatus } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
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
  const [loadingTrainingDetails, setLoadingTrainingDetails] = useState(false);

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

  const [selectedCollegeInfo, setSelectedCollegeInfo] = useState<{ name: string; address?: string } | null>(null);
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);

  // Processing Modal State
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [isApprovedAction, setIsApprovedAction] = useState<boolean>(true);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Document Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingPath, setViewingPath] = useState<string | null>(null);
  const [viewingPublicId, setViewingPublicId] = useState<string | null>(null);
  const [viewingTitle, setViewingTitle] = useState<string>('Document Preview');

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
      setAllTrainingRequests(res);
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
      return <Badge variant="success">Approved</Badge>;
    }
    if (isPendingStatus(status)) {
      return <Badge variant="warning">Pending Review</Badge>;
    }
    return <Badge variant="danger">Rejected</Badge>;
  };

  // Filtered Training Requests (Split into Pending and Handled)
  const pendingTrainingRequests = useMemo(() => {
    return allTrainingRequests.filter((r) => isPendingStatus(r.status));
  }, [allTrainingRequests]);

  const handledTrainingRequests = useMemo(() => {
    return allTrainingRequests.filter((r) => !isPendingStatus(r.status));
  }, [allTrainingRequests]);

  // Filter with Search
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
    setViewingPath(null);
    setViewingTitle(`Proof_${studentName}`);
    setViewerOpen(true);
  };

  const handleOpenTrainingDocViewer = (path: string, studentName: string) => {
    setViewingPath(path);
    setViewingPublicId(null);
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
      setLoadingTrainingDetails(true);
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
    } finally {
      setLoadingTrainingDetails(false);
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
      // Fallback display if not linked yet
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

  const handleOpenCollegeModal = (collegeName?: string) => {
    if (!collegeName) return;
    setSelectedCollegeInfo({ name: collegeName });
    setCollegeModalOpen(true);
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
        toast.success(`Student upgrade request ${isApprovedAction ? 'approved' : 'rejected'}`);
        setProcessModalOpen(false);
        setUpgradeDetailsModalOpen(false);
        fetchStudentUpgrades();
      } else {
        await trainingService.processRequest({
          requestPublicId: selectedRequestId,
          isApproved: isApprovedAction,
          rejectionReason: !isApprovedAction ? rejectionReason : undefined,
        });
        toast.success(`Training request ${isApprovedAction ? 'approved' : 'rejected'}`);
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

  // Columns for Pending Student Upgrades
  const pendingUpgradeColumns: Column<CollegeStudentsUpgradeRequestsListDto>[] = [
    {
      header: 'Student Name',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleViewUpgradeDetails(item.publicId);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view student details"
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
      header: 'Requested Role',
      cell: (item) => <Badge variant="indigo">{item.requestedRole || 'Student'}</Badge>,
    },
    {
      header: 'College',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenCollegeModal(item.collegeName);
          }}
          className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="Click to view college details"
        >
          <School className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.collegeName || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Proof File',
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
            View Proof Document
          </Button>
        ) : (
          <span className="text-slate-400">None</span>
        ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUpgradeDetails(item.publicId)}
            leftIcon={<Info className="w-4 h-4 text-slate-500" />}
          >
            Details
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
            Approve
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
            Reject
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Handled Student Upgrades (Clean table with clickable entities)
  const handledUpgradeColumns: Column<CollegeStudentsUpgradeRequestsListDto>[] = [
    {
      header: 'Student Name',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleViewUpgradeDetails(item.publicId);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view student details"
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
      header: 'Requested Role',
      cell: (item) => <Badge variant="indigo">{item.requestedRole || 'Student'}</Badge>,
    },
    {
      header: 'College',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenCollegeModal(item.collegeName);
          }}
          className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="Click to view college details"
        >
          <School className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.collegeName || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (item) => renderStatusBadge(item.status),
    },
    {
      header: 'Proof File',
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
            View Document
          </Button>
        ) : (
          <span className="text-slate-400">None</span>
        ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewUpgradeDetails(item.publicId)}
          leftIcon={<Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Columns for Pending Training Requests (With clickable student & company)
  const pendingTrainingColumns: Column<PendingTrainingRequestDto>[] = [
    {
      header: 'Student Name',
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
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.studentName}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Target Company',
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
          <span className="font-medium">{item.companyName || 'Unspecified'}</span>
        </div>
      ),
    },
    {
      header: 'Start Date',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.startDate || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Acceptance Letter',
      cell: (item) =>
        item.acceptanceLetterPath ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenTrainingDocViewer(item.acceptanceLetterPath!, item.studentName);
            }}
            leftIcon={<Eye className="w-4 h-4 text-indigo-500" />}
          >
            View Letter
          </Button>
        ) : (
          <span className="text-slate-400">None</span>
        ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewTrainingDetails(item.id, item)}
            leftIcon={<Info className="w-4 h-4 text-slate-500" />}
          >
            Details
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
            Approve
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
            Reject
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Handled Training Requests (With clickable student & company)
  const handledTrainingColumns: Column<PendingTrainingRequestDto>[] = [
    {
      header: 'Student Name',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStudentProfileModal(item.id, item.studentName);
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Click to view student profile"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-3.5 h-3.5" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.studentName}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Target Company',
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
          <span className="font-medium">{item.companyName || 'Unspecified'}</span>
        </div>
      ),
    },
    {
      header: 'Start Date',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.startDate || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (item) => renderStatusBadge(item.status),
    },
    {
      header: 'Acceptance Letter',
      cell: (item) =>
        item.acceptanceLetterPath ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenTrainingDocViewer(item.acceptanceLetterPath!, item.studentName);
            }}
            leftIcon={<Eye className="w-4 h-4 text-indigo-500" />}
          >
            View Document
          </Button>
        ) : (
          <span className="text-slate-400">None</span>
        ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewTrainingDetails(item.id, item)}
          leftIcon={<Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Requests Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review pending student upgrade applications and summer training requests, and view handled history
          </p>
        </div>
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
          <span>Student Registration Requests</span>
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
          <span>Summer Training Requests</span>
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
            <span>Pending</span>
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
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Handled History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
              {activeCategory === 'student-upgrades'
                ? handledStudentUpgrades.length
                : handledTrainingRequests.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Tables based on Category & Status */}
      {activeCategory === 'student-upgrades' ? (
        activeStatusTab === 'pending' ? (
          <Table
            columns={pendingUpgradeColumns}
            data={filteredPendingUpgrades}
            keyExtractor={(item) => item.publicId}
            isLoading={loadingUpgrades}
            onRowClick={(item) => handleViewUpgradeDetails(item.publicId)}
            emptyMessage={searchQuery ? 'No matching pending requests.' : 'No pending student registration requests.'}
          />
        ) : (
          <Table
            columns={handledUpgradeColumns}
            data={filteredHandledUpgrades}
            keyExtractor={(item) => item.publicId}
            isLoading={loadingUpgrades}
            onRowClick={(item) => handleViewUpgradeDetails(item.publicId)}
            emptyMessage={searchQuery ? 'No matching handled requests.' : 'No handled student registration requests yet.'}
          />
        )
      ) : activeStatusTab === 'pending' ? (
        <Table
          columns={pendingTrainingColumns}
          data={filteredPendingTrainings}
          keyExtractor={(item) => item.id || item.requestPublicId || item.studentName}
          isLoading={loadingTrainings}
          onRowClick={(item) => handleViewTrainingDetails(item.id, item)}
          emptyMessage={searchQuery ? 'No matching pending requests.' : 'No pending summer training requests.'}
        />
      ) : (
        <Table
          columns={handledTrainingColumns}
          data={filteredHandledTrainings}
          keyExtractor={(item) => item.id || item.requestPublicId || item.studentName}
          isLoading={loadingTrainings}
          onRowClick={(item) => handleViewTrainingDetails(item.id, item)}
          emptyMessage={searchQuery ? 'No matching handled requests.' : 'No handled summer training requests yet.'}
        />
      )}

      {/* Student Upgrade Request Details Modal */}
      <Modal
        isOpen={upgradeDetailsModalOpen}
        onClose={() => setUpgradeDetailsModalOpen(false)}
        title="Student Registration Request Details"
      >
        {selectedUpgradeDetails ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {selectedUpgradeDetails.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {selectedUpgradeDetails.userName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedUpgradeDetails.officialEmail}
                  </p>
                </div>
              </div>
              <div>{renderStatusBadge(selectedUpgradeDetails.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Requested Role</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedUpgradeDetails.requestedRole || 'Student'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">College</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedUpgradeDetails.collegeName || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Submitted Date</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedUpgradeDetails.createdAt
                    ? new Date(selectedUpgradeDetails.createdAt).toLocaleDateString()
                    : '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Reviewed Date</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedUpgradeDetails.reviewedAt
                    ? new Date(selectedUpgradeDetails.reviewedAt).toLocaleDateString()
                    : 'Pending Review'}
                </span>
              </div>
            </div>

            {selectedUpgradeDetails.comment && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                  Reviewer Notes / Feedback:
                </span>
                <p className="text-xs text-amber-800 dark:text-amber-200/90 italic leading-relaxed">
                  "{selectedUpgradeDetails.comment}"
                </p>
              </div>
            )}

            {selectedUpgradeDetails.proofFilePath && (
              <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Official Student Enrollment Proof Document
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleOpenProofViewer(selectedUpgradeDetails.id, selectedUpgradeDetails.userName)
                  }
                  leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
                >
                  Preview Document
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setUpgradeDetailsModalOpen(false)}>
                Close
              </Button>
              {isPendingStatus(selectedUpgradeDetails.status) && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setUpgradeDetailsModalOpen(false);
                      handleOpenProcess(selectedUpgradeDetails.id, false);
                    }}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      setUpgradeDetailsModalOpen(false);
                      handleOpenProcess(selectedUpgradeDetails.id, true);
                    }}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">Loading request details...</div>
        )}
      </Modal>      {/* Summer Training Request Details Modal */}
      <Modal
        isOpen={trainingDetailsModalOpen}
        onClose={() => setTrainingDetailsModalOpen(false)}
        title="Summer Training Request Details"
      >
        {loadingTrainingDetails ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading training request details...</div>
        ) : selectedTrainingDetails ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {selectedTrainingDetails.studentName ? selectedTrainingDetails.studentName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {selectedTrainingDetails.studentName || 'Student Trainee'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {selectedTrainingDetails.collegeName || 'Enrolled College'}
                  </p>
                </div>
              </div>
              <div>{renderStatusBadge(selectedTrainingDetails.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Target Company</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedTrainingDetails.companyName || 'Unspecified'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Training Period</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedTrainingDetails.startDate && selectedTrainingDetails.endDate
                    ? `${selectedTrainingDetails.startDate} → ${selectedTrainingDetails.endDate}`
                    : selectedTrainingDetails.startDate || '-'}
                </span>
              </div>

              {selectedTrainingDetails.academicYear && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Academic Term</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Year {selectedTrainingDetails.academicYear} {selectedTrainingDetails.semester ? `(${selectedTrainingDetails.semester})` : ''}
                  </span>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Submission Date</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedTrainingDetails.createdAt || selectedTrainingDetails.submittedAt
                    ? new Date(selectedTrainingDetails.createdAt || selectedTrainingDetails.submittedAt!).toLocaleDateString()
                    : '-'}
                </span>
              </div>
            </div>

            {selectedTrainingDetails.comment && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/50 text-xs">
                <span className="text-amber-800 dark:text-amber-300 font-semibold block mb-1">
                  Reviewer Feedback / Comments
                </span>
                <p className="text-slate-700 dark:text-slate-300">{selectedTrainingDetails.comment}</p>
              </div>
            )}

            {selectedTrainingDetails.acceptanceLetterPath && (
              <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Company Acceptance Letter
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleOpenTrainingDocViewer(
                      selectedTrainingDetails.acceptanceLetterPath!,
                      selectedTrainingDetails.studentName || 'Student'
                    )
                  }
                  leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
                >
                  Preview Letter
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setTrainingDetailsModalOpen(false)}>
                Close
              </Button>
              {isPendingStatus(selectedTrainingDetails.status) && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setTrainingDetailsModalOpen(false);
                      handleOpenProcess(selectedTrainingDetails.id || selectedTrainingDetails.requestPublicId!, false);
                    }}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      setTrainingDetailsModalOpen(false);
                      handleOpenProcess(selectedTrainingDetails.id || selectedTrainingDetails.requestPublicId!, true);
                    }}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Student Profile Modal */}
      <Modal
        isOpen={studentProfileModalOpen}
        onClose={() => setStudentProfileModalOpen(false)}
        title="Student Profile & Academic Information"
      >
        {loadingStudentProfile ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading student profile...</div>
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
                  <span className="text-[10px] text-slate-400 block font-medium">GPA</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {Number(selectedStudentProfile.gpa).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> University ID
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono block">
                  {selectedStudentProfile.universityIdNumber || 'Not Specified'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Major
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.major || 'Undergraduate Student'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50 col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <School className="w-3.5 h-3.5" /> College
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedStudentProfile.collegeName || 'Enrolled College'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Official Email
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.email || '-'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedStudentProfile.phoneNumber || '-'}
                </span>
              </div>
            </div>

            {selectedStudentProfile.activeTraining && (
              <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    {selectedStudentProfile.activeTraining.companyName || 'Assigned Company'}
                  </span>
                  <Badge variant="indigo">{selectedStudentProfile.activeTraining.trainingStatus}</Badge>
                </div>
                {selectedStudentProfile.activeTraining.startDate && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Period: {selectedStudentProfile.activeTraining.startDate} → {selectedStudentProfile.activeTraining.endDate || 'Ongoing'}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setStudentProfileModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Company Details Modal */}
      <Modal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        title="Company Information"
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
                  Summer Training Partner Organization
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Headquarters / Address</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedCompanyInfo.address || 'Kingdom of Saudi Arabia'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Contact Email</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {selectedCompanyInfo.contactEmail || '-'}
                </span>
              </div>

              {selectedCompanyInfo.studentName && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">Trainee Candidate</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedCompanyInfo.studentName}
                    </span>
                  </div>
                  {selectedCompanyInfo.status && renderStatusBadge(selectedCompanyInfo.status)}
                </div>
              )}

              {selectedCompanyInfo.trainingPeriod && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50 col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">Training Duration</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedCompanyInfo.trainingPeriod}
                  </span>
                </div>
              )}
            </div>

            {selectedCompanyInfo.acceptanceLetterPath && (
              <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Official Company Acceptance Letter
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleOpenTrainingDocViewer(
                      selectedCompanyInfo.acceptanceLetterPath!,
                      selectedCompanyInfo.studentName || 'Company'
                    )
                  }
                  leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
                >
                  View Document
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setCompanyModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* College Details Modal */}
      <Modal
        isOpen={collegeModalOpen}
        onClose={() => setCollegeModalOpen(false)}
        title="College Information"
      >
        {selectedCollegeInfo ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">
                  {selectedCollegeInfo.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Academic Institution / Training Coordinator
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Campus Location</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedCollegeInfo.address || 'University Main Campus'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Affiliation Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accredited Institution
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setCollegeModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Approve / Reject Modal */}
      <Modal
        isOpen={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        title={`${isApprovedAction ? 'Approve' : 'Reject'} Request`}
      >
        <form onSubmit={handleProcessSubmit} className="space-y-4">
          {!isApprovedAction && (
            <Input
              label="Rejection Reason"
              placeholder="State reason for rejecting request"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          )}
          <p className="text-xs text-slate-500">
            Are you sure you want to {isApprovedAction ? 'approve' : 'reject'} this request?
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setProcessModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={isApprovedAction ? 'success' : 'danger'} isLoading={submitting}>
              Confirm {isApprovedAction ? 'Approval' : 'Rejection'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Viewer Modal */}
      {viewerOpen && (
        <FileViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setViewingPath(null);
            setViewingPublicId(null);
          }}
          title="Document Preview"
          fileName={viewingTitle}
          fetchBlob={() =>
            viewingPublicId
              ? collegeService.getProofFileBlob(viewingPublicId)
              : reportsService.downloadAttachmentBlob(viewingPath!)
          }
        />
      )}
    </div>
  );
};


