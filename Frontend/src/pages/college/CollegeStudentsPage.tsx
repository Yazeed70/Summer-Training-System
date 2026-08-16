import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Trash2,
  Building2,
  Search,
  GraduationCap,
  Mail,
  Phone,
  School,
  User,
  Info,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { collegeService } from '../../api/collegeService';
import { CollegeStudentsListDto, StudentProfileResponseDto } from '../../types/dashboard';
import { enTrainingStatus } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const CollegeStudentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<CollegeStudentsListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [studentPublicId, setStudentPublicId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Student Profile Modal State
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfileResponseDto | null>(null);
  const [studentProfileModalOpen, setStudentProfileModalOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Company Details Modal State
  const [selectedCompanyInfo, setSelectedCompanyInfo] = useState<{
    name: string;
    studentName?: string;
    status?: enTrainingStatus;
  } | null>(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await collegeService.getCollegeStudents();
      setStudents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentPublicId.trim()) {
      toast.error('Student Public ID is required');
      return;
    }
    try {
      setSubmitting(true);
      await collegeService.linkStudent(studentPublicId.trim());
      toast.success('Student linked to college roster');
      setLinkModalOpen(false);
      setStudentPublicId('');
      fetchStudents();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async (pubId: string) => {
    if (!window.confirm('Unlink student from college?')) return;
    try {
      await collegeService.unlinkStudent(pubId);
      toast.success('Student unlinked');
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenStudentProfile = async (publicId: string, fallbackName?: string) => {
    try {
      setLoadingProfile(true);
      setStudentProfileModalOpen(true);
      const profile = await collegeService.getStudentProfile(publicId);
      setSelectedStudentProfile(profile);
    } catch (err) {
      console.error(err);
      setSelectedStudentProfile({
        id: publicId,
        name: fallbackName || 'Student',
        username: publicId,
        collegeName: 'Enrolled College',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenCompanyDetails = (companyName: string, studentName: string, status?: enTrainingStatus) => {
    setSelectedCompanyInfo({
      name: companyName,
      studentName,
      status,
    });
    setCompanyModalOpen(true);
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(query) ||
        (s.activeTraining?.companyName && s.activeTraining.companyName.toLowerCase().includes(query)) ||
        s.publicId.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const getTrainingStatusBadge = (status?: enTrainingStatus) => {
    switch (status) {
      case enTrainingStatus.Active:
        return <Badge variant="success">{status}</Badge>;
      case enTrainingStatus.Completed:
        return <Badge variant="indigo">{status}</Badge>;
      case enTrainingStatus.Terminated:
      case enTrainingStatus.Failed:
        return <Badge variant="danger">{status}</Badge>;
      case enTrainingStatus.NotStarted:
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="neutral">No Active Training</Badge>;
    }
  };

  const columns: Column<CollegeStudentsListDto>[] = [
    {
      header: 'Student',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStudentProfile(item.publicId, item.studentName);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view full student profile"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.studentName}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{item.publicId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Company',
      cell: (item) =>
        item.activeTraining?.companyName ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCompanyDetails(
                item.activeTraining!.companyName!,
                item.studentName,
                item.activeTraining?.trainingStatus
              );
            }}
            className="flex items-center gap-2 cursor-pointer group hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Click to view company info"
          >
            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {item.activeTraining.companyName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">Not Assigned</span>
        ),
    },
    {
      header: 'Training Status',
      cell: (item) => getTrainingStatusBadge(item.activeTraining?.trainingStatus),
    },
    {
      header: 'Completed Reports',
      cell: (item) => <Badge variant="indigo">{item.completedReports ?? 0} Reports</Badge>,
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenStudentProfile(item.publicId, item.studentName)}
            title="View Profile"
            className="text-slate-500 hover:text-indigo-600"
          >
            <Info className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleUnlink(item.publicId);
            }}
            title="Unlink Student"
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.studentRoster')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage students enrolled under your college for summer training
          </p>
        </div>

        <Button onClick={() => setLinkModalOpen(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
          Link Student by ID
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, company, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredStudents}
        keyExtractor={(item) => item.publicId}
        isLoading={loading}
        onRowClick={(item) => handleOpenStudentProfile(item.publicId, item.studentName)}
        emptyMessage={searchQuery ? 'No matching students found.' : 'No students linked to college yet.'}
      />

      {/* Link Student Modal */}
      <Modal isOpen={linkModalOpen} onClose={() => setLinkModalOpen(false)} title="Link Student to College Roster">
        <form onSubmit={handleLinkStudent} className="space-y-4">
          <Input
            label="Student Public GUID / ID"
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            value={studentPublicId}
            onChange={(e) => setStudentPublicId(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Link Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Profile Modal */}
      <Modal
        isOpen={studentProfileModalOpen}
        onClose={() => setStudentProfileModalOpen(false)}
        title="Student Profile & Academic Information"
      >
        {loadingProfile ? (
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
                  Summer Training Partner Entity
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {selectedCompanyInfo.studentName && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Trainee Student</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedCompanyInfo.studentName}
                    </span>
                  </div>
                  {selectedCompanyInfo.status && getTrainingStatusBadge(selectedCompanyInfo.status)}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setCompanyModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

