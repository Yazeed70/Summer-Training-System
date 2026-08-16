import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Plus,
  Calendar,
  Building,
  Building2,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Inbox,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { studentService } from '../../api/studentService';
import { trainingService } from '../../api/trainingService';
import { reportsService } from '../../api/reportsService';
import { lookupsService, LookupItem } from '../../api/lookupsService';
import { StudentProfileResponseDto } from '../../types/dashboard';
import { PendingTrainingRequestDto, MyTrainingRequestDto } from '../../types/training';
import { enRequestStatus, enTrainingStatus, enSemesterType } from '../../types/enums';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TrainingTimeline } from '../../components/tracking/TrainingTimeline';
import { FileViewerModal } from '../../components/ui/FileViewerModal';

export const StudentDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<StudentProfileResponseDto | null>(null);
  const [requests, setRequests] = useState<PendingTrainingRequestDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Submit Modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [companies, setCompanies] = useState<LookupItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState<string>(enSemesterType.Summer.toString());
  const [acceptanceFile, setAcceptanceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Request Details Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<MyTrainingRequestDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Document Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingPath, setViewingPath] = useState<string | null>(null);
  const [viewingPublicId, setViewingPublicId] = useState<string | null>(null);
  const [viewingTitle, setViewingTitle] = useState('Acceptance_Letter');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profRes, reqRes] = await Promise.all([
        studentService.getMyProfile().catch(() => null),
        trainingService.getStudentPendingRequests().catch(() => []),
      ]);
      setProfile(profRes);
      setRequests(reqRes || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    lookupsService.getCompanies().then(setCompanies).catch(console.error);
  }, []);

  const handleOpenDetails = async (requestId: string, fallback?: PendingTrainingRequestDto) => {
    try {
      setLoadingDetails(true);
      setDetailsModalOpen(true);
      const details = await trainingService.getPendingRequest(requestId);
      setSelectedRequestDetails(details);
    } catch (err) {
      console.error('Failed to fetch request details:', err);
      if (fallback) {
        setSelectedRequestDetails({
          id: fallback.id,
          studentName: fallback.studentName,
          companyName: fallback.companyName,
          startDate: fallback.startDate,
          endDate: fallback.endDate,
          status: fallback.status,
          acceptanceLetterPath: fallback.acceptanceLetterPath,
          createdAt: fallback.createdAt,
        });
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewAcceptanceDoc = (publicId: string, companyName?: string, filePath?: string) => {
    setViewingPublicId(publicId);
    setViewingPath(filePath || null);
    setViewingTitle(`Acceptance_Letter_${companyName || 'Document'}`);
    setViewerOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompanyId) {
      toast.error('Please select a company or choose "Other"');
      return;
    }

    if (selectedCompanyId === 'other' && !customCompanyName.trim()) {
      toast.error('Please enter the custom company name');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (!acceptanceFile) {
      toast.error('Please upload your company acceptance letter');
      return;
    }

    try {
      setSubmitting(true);
      await trainingService.submitRequest({
        companyId: selectedCompanyId !== 'other' ? Number(selectedCompanyId) : undefined,
        companyName: selectedCompanyId === 'other' ? customCompanyName.trim() : undefined,
        suggestedCompanyName: selectedCompanyId === 'other' ? customCompanyName.trim() : undefined,
        startDate,
        endDate,
        academicYear,
        semester: semester === enSemesterType.Summer ? enSemesterType.Summer : semester === enSemesterType.First ? enSemesterType.First : enSemesterType.Second,
        acceptanceLetterFile: acceptanceFile,
      });

      toast.success('Training request submitted successfully');
      setRequestModalOpen(false);
      // Reset form
      setSelectedCompanyId('');
      setCustomCompanyName('');
      setStartDate('');
      setEndDate('');
      setAcceptanceFile(null);
      fetchData();
    } catch (err: any) {
      console.error('Failed to submit request:', err);
      const msg = err.response?.data?.devMessage || err.response?.data?.message || 'Failed to submit training request.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const latestRequest = requests[0];

  const pendingRequests = useMemo(() => requests.filter((r) => r.status === enRequestStatus.Pending || (r.status as any) === 1 || String(r.status).toLowerCase() === 'pending'), [requests]);
  const approvedRequests = useMemo(() => requests.filter((r) => r.status === enRequestStatus.Approved || (r.status as any) === 2 || String(r.status).toLowerCase() === 'approved'), [requests]);
  const rejectedRequests = useMemo(() => requests.filter((r) => r.status === enRequestStatus.Rejected || (r.status as any) === 3 || String(r.status).toLowerCase() === 'rejected'), [requests]);

  const filteredRequests = useMemo(() => {
    switch (statusFilter) {
      case 'pending':
        return pendingRequests;
      case 'approved':
        return approvedRequests;
      case 'rejected':
        return rejectedRequests;
      case 'all':
      default:
        return requests;
    }
  }, [statusFilter, requests, pendingRequests, approvedRequests, rejectedRequests]);

  const renderStatusBadge = (status: enRequestStatus | string | number) => {
    if (status === enRequestStatus.Approved || (status as any) === 2 || String(status).toLowerCase() === 'approved') {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Approved</span>
        </Badge>
      );
    }
    if (status === enRequestStatus.Rejected || (status as any) === 3 || String(status).toLowerCase() === 'rejected') {
      return (
        <Badge variant="danger" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          <span>Rejected</span>
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>Pending Review</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('nav.myTraining')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your summer training requests, lifecycle timeline, and company acceptance letters
          </p>
        </div>

        <Button
          onClick={() => setRequestModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-indigo-600/20 shadow-md hover:shadow-indigo-600/30 transition-all"
        >
          Submit New Training Request
        </Button>
      </div>

      {/* Training Progress Tracker Card */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Training Progress Tracker</h3>
            </div>
            {profile?.activeTraining?.companyName && (
              <Badge variant="indigo" size="sm">
                Active at: {profile.activeTraining.companyName}
              </Badge>
            )}
          </div>
        }
      >
        <TrainingTimeline
          hasSubmittedRequest={requests.length > 0}
          requestStatus={latestRequest?.status}
          trainingStatus={profile?.activeTraining?.trainingStatus}
          startDate={profile?.activeTraining?.startDate || latestRequest?.startDate}
          endDate={profile?.activeTraining?.endDate || latestRequest?.endDate}
        />

        {requests.length === 0 && !profile?.activeTraining && (
          <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>You haven't submitted any training requests yet. Start your journey by submitting a request.</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRequestModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Submit Request
            </Button>
          </div>
        )}
      </Card>

      {/* Requests Full List Section */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Training Requests & History</h3>
              <Badge variant="neutral" size="sm">
                {requests.length} Total
              </Badge>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All ({requests.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Pending ({pendingRequests.length})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'approved'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Approved ({approvedRequests.length})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'rejected'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Rejected ({rejectedRequests.length})
              </button>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <span>Loading training requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {statusFilter === 'all'
                  ? 'No training requests submitted yet'
                  : `No ${statusFilter} training requests`}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                {statusFilter === 'all'
                  ? 'Submit your summer training application with the host company acceptance letter.'
                  : 'Try selecting a different filter tab above to view your other requests.'}
              </p>
            </div>
            {statusFilter === 'all' && (
              <Button
                size="sm"
                onClick={() => setRequestModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-2"
              >
                Submit Training Request
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => handleOpenDetails(req.id, req)}
                className="group p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {req.companyName || 'Unspecified Company'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                      {req.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {req.startDate} {req.endDate ? `to ${req.endDate}` : ''}
                          </span>
                        </span>
                      )}

                      {req.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                        </span>
                      )}

                      {req.acceptanceLetterPath && (
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Acceptance Letter Attached</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                  {renderStatusBadge(req.status)}

                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Eye className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(req.id, req);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Request Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedRequestDetails(null);
        }}
        title="Training Request Details"
        maxWidth="2xl"
      >
        {loadingDetails && !selectedRequestDetails ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <span>Loading request details...</span>
          </div>
        ) : selectedRequestDetails ? (
          <div className="space-y-5">
            {/* Header / Company Block */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-indigo-500/20 shadow-md">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedRequestDetails.companyName || 'Host Company'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Student: {selectedRequestDetails.studentName || profile?.name || 'Student'}
                  </p>
                </div>
              </div>

              <div>{renderStatusBadge(selectedRequestDetails.status)}</div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                <p className="text-slate-400">Start Date</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequestDetails.startDate || '-'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                <p className="text-slate-400">End Date</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequestDetails.endDate || '-'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                <p className="text-slate-400">Duration</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequestDetails.durationInWeeks ? `${selectedRequestDetails.durationInWeeks} Weeks` : '-'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                <p className="text-slate-400">Academic Year</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequestDetails.academicYear || '-'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                <p className="text-slate-400">Semester</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequestDetails.semester === enSemesterType.Summer || (selectedRequestDetails.semester as any) === 3
                    ? 'Summer'
                    : selectedRequestDetails.semester === enSemesterType.First || (selectedRequestDetails.semester as any) === 1
                    ? 'First'
                    : selectedRequestDetails.semester === enSemesterType.Second || (selectedRequestDetails.semester as any) === 2
                    ? 'Second'
                    : selectedRequestDetails.semester || '-'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                <p className="text-slate-400">Submitted At</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedRequestDetails.createdAt
                    ? new Date(selectedRequestDetails.createdAt).toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>

            {/* Reviewer Note / Feedback */}
            {selectedRequestDetails.comment && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  selectedRequestDetails.status === enRequestStatus.Rejected
                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                    : 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {selectedRequestDetails.status === enRequestStatus.Rejected
                      ? 'Rejection Feedback / Reason'
                      : 'Reviewer Feedback'}
                  </span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{selectedRequestDetails.comment}</p>
                {selectedRequestDetails.reviewedByUserName && (
                  <p className="text-[11px] opacity-75 pt-1">
                    Reviewed by: {selectedRequestDetails.reviewedByUserName}{' '}
                    {selectedRequestDetails.reviewedAt
                      ? `on ${new Date(selectedRequestDetails.reviewedAt).toLocaleDateString()}`
                      : ''}
                  </p>
                )}
              </div>
            )}

            {/* Document Action */}
            {selectedRequestDetails.acceptanceLetterPath && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Company Acceptance Letter</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5 text-indigo-500" />}
                  onClick={() =>
                    handleViewAcceptanceDoc(
                      selectedRequestDetails.id!,
                      selectedRequestDetails.companyName,
                      selectedRequestDetails.acceptanceLetterPath
                    )
                  }
                >
                  View Document
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Submit Training Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Submit Training Request"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <Select
            label="Training Partner Company"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            placeholder="Select registered company or 'Other'"
            options={[
              ...companies.map((c) => ({ value: c.id, label: c.name })),
              { value: 'other', label: 'Other (Specify company name below)' },
            ]}
            required
          />

          {selectedCompanyId === 'other' && (
            <Input
              label="Other Company Name *"
              placeholder="e.g. Saudi Aramco / STC / Elm"
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date *"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Academic Year *"
              placeholder="e.g. 2025/2026"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            />

            <Select
              label="Semester *"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              options={[
                { value: enSemesterType.Summer.toString(), label: 'Summer Semester' },
                { value: enSemesterType.First.toString(), label: 'First Semester' },
                { value: enSemesterType.Second.toString(), label: 'Second Semester' },
              ]}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upload Company Acceptance Letter (PDF/IMG) *
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setAcceptanceFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-indigo-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Submit Request
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
            setViewingPublicId(null);
            setViewingPath(null);
          }}
          title="Acceptance Letter Preview"
          fileName={viewingTitle}
          fetchBlob={() =>
            viewingPublicId
              ? studentService.getProofFileBlob(viewingPublicId)
              : reportsService.downloadAttachmentBlob(viewingPath!)
          }
        />
      )}
    </div>
  );
};
