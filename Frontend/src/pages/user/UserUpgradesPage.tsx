import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  UserCheck,
  Clock,
  GraduationCap,
  ArrowUpRight,
  XCircle,
  Shield,
  Eye,
  FileText,
  Building2,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';
import { userService } from '../../api/userService';
import { lookupsService, LookupItem } from '../../api/lookupsService';
import { UpgradeRequestDetailsDto } from '../../types/dashboard';
import { enRoles, enRequestStatus } from '../../types/enums';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { FileViewerModal } from '../../components/ui/FileViewerModal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const UserUpgradesPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState<UpgradeRequestDetailsDto | null>(null);
  const [history, setHistory] = useState<UpgradeRequestDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [repModalOpen, setRepModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Details Modal & Proof Viewer state
  const [selectedDetails, setSelectedDetails] = useState<UpgradeRequestDetailsDto | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [viewingProofId, setViewingProofId] = useState<string | null>(null);
  const [viewingProofName, setViewingProofName] = useState<string>('Proof Document');

  const [colleges, setColleges] = useState<LookupItem[]>([]);
  const [companies, setCompanies] = useState<LookupItem[]>([]);

  // Form states
  const [targetRole, setTargetRole] = useState<enRoles>(enRoles.CollegeRep);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, historyRes] = await Promise.all([
        userService.getUpgradeStatus().catch(() => null),
        userService.getUpgradeHistory().catch(() => []),
      ]);
      setActiveStatus(statusRes);
      setHistory(historyRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    lookupsService.getColleges().then(setColleges).catch(console.error);
    lookupsService.getCompanies().then(setCompanies).catch(console.error);
  }, []);

  const handleViewDetails = (item: UpgradeRequestDetailsDto) => {
    setSelectedDetails(item);
    setDetailsModalOpen(true);
  };

  const handleOpenProofViewer = (publicId: string, roleName: string) => {
    setViewingProofId(publicId);
    setViewingProofName(`Proof_${roleName}`);
    setFileViewerOpen(true);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollegeId || !officialEmail || !proofFile) {
      toast.error('College, official email, and proof file are required');
      return;
    }
    try {
      setSubmitting(true);
      await userService.upgradeToStudent({
        requestedRoleId: enRoles.Student,
        collegeId: Number(selectedCollegeId),
        officialEmail,
        proofFile,
      });
      toast.success('Student upgrade request submitted');
      setStudentModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialEmail || !proofFile) {
      toast.error('Official email and proof file are required');
      return;
    }
    try {
      setSubmitting(true);
      await userService.upgradeRequest({
        requestedRoleId: Number(targetRole) as enRoles,
        collegeId: selectedCollegeId ? Number(selectedCollegeId) : undefined,
        companyId: selectedCompanyId ? Number(selectedCompanyId) : undefined,
        officialEmail,
        proofFile,
      });
      toast.success('Representative upgrade request submitted');
      setRepModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    const targetId = activeStatus?.id || selectedDetails?.id;
    if (!targetId) return;
    try {
      setSubmitting(true);
      await userService.cancelUpgradeRequest(targetId);
      toast.success('Request canceled successfully');
      setCancelModalOpen(false);
      setDetailsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = activeStatus?.status === enRequestStatus.Pending || (activeStatus?.status as any) === 1 || String(activeStatus?.status).toLowerCase() === 'pending';

  const columns: Column<UpgradeRequestDetailsDto>[] = [
    {
      header: 'Requested Role',
      cell: (item) => <Badge variant="indigo">{item.requestedRole}</Badge>,
    },
    {
      header: 'Target Entity',
      cell: (item) => item.collegeName || item.companyName || '-',
    },
    {
      header: 'Official Email',
      cell: (item) => item.officialEmail || '-',
    },
    {
      header: 'Submitted Date',
      cell: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      header: 'Status',
      cell: (item) => {
        const val = String(item.status);
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
        return <Badge variant={variantMap[val] ?? 'neutral'}>{labelMap[val] ?? val}</Badge>;
      },
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(item)}
            title="View Application Details"
          >
            <Eye className="w-4 h-4 text-slate-500 hover:text-indigo-600" />
          </Button>
          {item.proofFilePath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenProofViewer(item.id, item.requestedRole)}
              title="View Attached Proof Document"
            >
              <FileText className="w-4 h-4 text-indigo-500 hover:text-indigo-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Role Upgrade Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit applications to become a Student, College Representative, or Company Representative
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStudentModalOpen(true)}
            leftIcon={<GraduationCap className="w-4 h-4 text-indigo-500" />}
          >
            Upgrade to Student
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setRepModalOpen(true)}
            leftIcon={<ArrowUpRight className="w-4 h-4 text-emerald-500" />}
          >
            Upgrade to Representative
          </Button>
        </div>
      </div>

      {/* Service Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student Service Card */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <Badge variant="indigo">Student Program</Badge>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">University Student Role</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Connect your account with your university college to apply for accredited summer training opportunities, submit weekly attendance and progress reports, and receive academic evaluations.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Apply for approved summer internship programs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Submit periodic reports & track task submissions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Reviewed directly by your College Representative</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={() => setStudentModalOpen(true)}
              leftIcon={<GraduationCap className="w-4 h-4 text-indigo-500" />}
            >
              Apply as Student
            </Button>
          </div>
        </Card>

        {/* Representative Service Card */}
        <Card className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <Badge variant="success">Institutional Representative</Badge>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">College or Company Representative</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Register as an official coordinator for your university college or supervisor for your company to manage trainees, approve summer training requests, and conduct formal student evaluations.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Supervise and manage student rosters and trainees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Review internship applications & training letters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Reviewed by System Administrators</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={() => setRepModalOpen(true)}
              leftIcon={<Shield className="w-4 h-4 text-emerald-500" />}
            >
              Apply as Representative
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Request Card */}
      {activeStatus && (
        <Card className="p-5 border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Latest Request: {activeStatus.requestedRole}
                  </h3>
                  <Badge variant={isPending ? 'warning' : activeStatus.status === enRequestStatus.Approved ? 'success' : 'danger'}>
                    {isPending ? 'Pending Review' : activeStatus.status === enRequestStatus.Approved ? 'Approved' : 'Rejected'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: {activeStatus.collegeName || activeStatus.companyName || '-'} • Official Email: {activeStatus.officialEmail}
                </p>
                {activeStatus.comment && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    Reviewer Note: {activeStatus.comment}
                  </p>
                )}
              </div>
            </div>

            {isPending && (
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:text-rose-700"
                onClick={() => setCancelModalOpen(true)}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Cancel Request
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* History Table */}
      <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Role Upgrade Application History</h3>}>
        <Table columns={columns} data={history} keyExtractor={(item) => item.id} isLoading={loading} emptyMessage="No upgrade applications submitted yet." />
      </Card>

      {/* Upgrade to Student Modal */}
      <Modal isOpen={studentModalOpen} onClose={() => setStudentModalOpen(false)} title="Upgrade to Student Role" maxWidth="lg">
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">
              This application will link your account as an accredited student under your college and will be reviewed directly by your college coordinator. Please provide your university email and upload an official enrollment document or university ID card.
            </p>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <Select
              label="College"
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              placeholder="Select your college"
              options={colleges.map((c) => ({ value: c.id, label: c.name }))}
              required
            />
            <Input
              label="Official Student Email"
              type="email"
              placeholder="student@university.edu.sa"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Student ID / Enrollment Proof Document (PDF/IMG)
              </label>
              <input
                type="file"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-slate-800 dark:file:text-indigo-400"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setStudentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting}>
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Upgrade to Representative Modal */}
      <Modal isOpen={repModalOpen} onClose={() => setRepModalOpen(false)} title="Upgrade to Representative Role" maxWidth="lg">
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
              Representative accounts grant authority to manage college or company training programs, oversee students, and submit official evaluations. Representative requests are reviewed and approved by system administrators.
            </p>
          </div>

          <form onSubmit={handleRepSubmit} className="space-y-4">
            <Select
              label="Target Representative Role"
              value={targetRole}
              onChange={(e) => setTargetRole(Number(e.target.value) as enRoles)}
              options={[
                { value: enRoles.CollegeRep, label: t('roles.collegeRep') },
                { value: enRoles.CompanyRep, label: t('roles.companyRep') },
              ]}
            />
            {Number(targetRole) === enRoles.CollegeRep && (
              <Select
                label="College"
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                placeholder="Select College"
                options={colleges.map((c) => ({ value: c.id, label: c.name }))}
                required
              />
            )}
            {Number(targetRole) === enRoles.CompanyRep && (
              <Select
                label="Company"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                placeholder="Select Company"
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
                required
              />
            )}
            <Input
              label="Official Work Email"
              type="email"
              placeholder="rep@institution.edu.sa"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Employment Proof / Authorization Letter (PDF/IMG)
              </label>
              <input
                type="file"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-slate-800 dark:file:text-indigo-400"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setRepModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting}>
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </Modal>


      {/* Full Request Details Modal */}
      <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Role Upgrade Application Details" maxWidth="4xl">
        {selectedDetails && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
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
                          : selectedDetails.status === enRequestStatus.Pending || (selectedDetails.status as any) === 1 || String(selectedDetails.status).toLowerCase() === 'pending'
                            ? 'warning'
                            : 'neutral'
                    }
                  >
                    {selectedDetails.status === enRequestStatus.Approved || (selectedDetails.status as any) === 2 || String(selectedDetails.status).toLowerCase() === 'approved'
                      ? 'Approved'
                      : selectedDetails.status === enRequestStatus.Rejected || (selectedDetails.status as any) === 3 || String(selectedDetails.status).toLowerCase() === 'rejected'
                        ? 'Rejected'
                        : selectedDetails.status === enRequestStatus.Pending || (selectedDetails.status as any) === 1 || String(selectedDetails.status).toLowerCase() === 'pending'
                          ? 'Pending Review'
                          : 'Canceled'}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Submission Date</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{new Date(selectedDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Target Entity</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedDetails.collegeName || selectedDetails.companyName || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Official Email</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedDetails.officialEmail || '-'}</p>
                </div>
                {selectedDetails.reviewedByName && (
                  <div>
                    <p className="text-slate-400 font-medium">Reviewed By</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedDetails.reviewedByName}</p>
                  </div>
                )}
                {selectedDetails.reviewedAt && (
                  <div>
                    <p className="text-slate-400 font-medium">Reviewed Date</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{new Date(selectedDetails.reviewedAt).toLocaleDateString()}</p>
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

            {selectedDetails.proofFilePath && (
              <div className="p-3.5 rounded-xl border border-indigo-200/60 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-900 dark:text-white">Uploaded Proof Document Attached</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenProofViewer(selectedDetails.id, selectedDetails.requestedRole)}
                  leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
                >
                  View Document
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
              {(selectedDetails.status === enRequestStatus.Pending || (selectedDetails.status as any) === 1 || String(selectedDetails.status).toLowerCase() === 'pending') && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setCancelModalOpen(true);
                  }}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Cancel Request
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Proof File Viewer Modal */}
      {viewingProofId && (
        <FileViewerModal
          isOpen={fileViewerOpen}
          onClose={() => {
            setFileViewerOpen(false);
            setViewingProofId(null);
          }}
          title="Uploaded Proof Document Preview"
          fileName={viewingProofName}
          fetchBlob={() => userService.getProofFileBlob(viewingProofId)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Upgrade Request"
        message="Are you sure you want to cancel your pending role upgrade request?"
        confirmText="Cancel Request"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};
