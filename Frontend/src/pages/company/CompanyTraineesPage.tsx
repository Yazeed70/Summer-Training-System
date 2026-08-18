import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Trash2,
  Search,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  School,
  User,
  Info,
  Building2,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { companyService } from '../../api/companyService';
import { CompanyStudentsListDto, StudentProfileResponseDto } from '../../types/dashboard';
import { enSemesterType, enTrainingStatus } from '../../types/enums';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';

export const CompanyTraineesPage: React.FC = () => {
  const { t } = useTranslation();
  const [trainees, setTrainees] = useState<CompanyStudentsListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'terminated'>('all');

  // Assign Trainee Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [studentPublicId, setStudentPublicId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState<string>(enSemesterType.Summer.toString());
  const [submitting, setSubmitting] = useState(false);

  // Student Profile Modal State
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfileResponseDto | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchTrainees = async () => {
    try {
      setLoading(true);
      const res = await companyService.getCompanyStudents();
      setTrainees(res || []);
    } catch (err) {
      console.error('Failed to fetch company trainees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, []);

  const handleLinkTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentPublicId.trim()) {
      toast.error('Student Public ID is required');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please specify both start and end dates');
      return;
    }

    try {
      setSubmitting(true);
      await companyService.linkStudent({
        studentPublicId: studentPublicId.trim(),
        startDate: startDate,
        endDate: endDate,
        academicYear: academicYear.trim(),
        semester: Number(semester) as unknown as enSemesterType,
        status: enTrainingStatus.Active,
      });
      toast.success('Trainee assigned to company successfully');
      setLinkModalOpen(false);
      setStudentPublicId('');
      setStartDate('');
      setEndDate('');
      fetchTrainees();
    } catch (err) {
      console.error('Failed to link trainee:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async (pubId: string) => {
    if (!window.confirm('Are you sure you want to terminate/unlink this trainee from your company?')) {
      return;
    }
    try {
      await companyService.unlinkStudent(pubId);
      toast.success('Trainee unlinked successfully');
      fetchTrainees();
    } catch (err) {
      console.error('Failed to unlink trainee:', err);
    }
  };

  const handleOpenStudentProfile = async (pubId: string, fallbackName?: string) => {
    try {
      setLoadingProfile(true);
      setProfileModalOpen(true);
      const profile = await companyService.getStudentProfile(pubId);
      setSelectedStudentProfile(profile);
    } catch (err) {
      console.error(err);
      setSelectedStudentProfile({
        id: pubId,
        name: fallbackName || 'Trainee Student',
        username: pubId,
        collegeName: 'Enrolled College',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const stats = useMemo(() => {
    const total = trainees.length;
    const active = trainees.filter(
      (t) => t.trainingStatus === enTrainingStatus.Active || (t.trainingStatus as any) === 2 || String(t.trainingStatus).toLowerCase() === 'active'
    ).length;
    const completed = trainees.filter(
      (t) => t.trainingStatus === enTrainingStatus.Completed || (t.trainingStatus as any) === 3 || String(t.trainingStatus).toLowerCase() === 'completed'
    ).length;
    const other = total - active - completed;

    return { total, active, completed, other };
  }, [trainees]);

  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      // Search Filter
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        t.studentName.toLowerCase().includes(q) ||
        (t.collegeName && t.collegeName.toLowerCase().includes(q)) ||
        (t.major && t.major.toLowerCase().includes(q)) ||
        t.studentPublicId.toLowerCase().includes(q);

      // Status Filter
      let matchesStatus = true;
      const statusStr = String(t.trainingStatus).toLowerCase();
      if (statusFilter === 'active') {
        matchesStatus = statusStr === 'active' || (t.trainingStatus as any) === 2;
      } else if (statusFilter === 'completed') {
        matchesStatus = statusStr === 'completed' || (t.trainingStatus as any) === 3;
      } else if (statusFilter === 'terminated') {
        matchesStatus = statusStr === 'terminated' || (t.trainingStatus as any) === 4 || statusStr === 'failed';
      }

      return matchesSearch && matchesStatus;
    });
  }, [trainees, searchQuery, statusFilter]);

  const getTrainingStatusBadge = (status?: enTrainingStatus | string | number) => {
    const statusStr = String(status).toLowerCase();
    if (statusStr === 'active' || (status as any) === 2) {
      return <Badge variant="success">Active Training</Badge>;
    }
    if (statusStr === 'completed' || (status as any) === 3) {
      return <Badge variant="indigo">Completed</Badge>;
    }
    if (statusStr === 'terminated' || statusStr === 'failed' || (status as any) === 4) {
      return <Badge variant="danger">Terminated</Badge>;
    }
    return <Badge variant="warning">{String(status || 'Active')}</Badge>;
  };

  const columns: Column<CompanyStudentsListDto>[] = [
    {
      header: 'Trainee Student',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStudentProfile(item.studentPublicId, item.studentName);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view full student profile"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm shrink-0 group-hover:ring-2 group-hover:ring-emerald-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {item.studentName}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{item.studentPublicId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'College',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
          <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-xs">{item.collegeName || 'Enrolled College'}</span>
        </div>
      ),
    },
    {
      header: 'Major / Department',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs">{item.major || 'Undergraduate'}</span>
        </div>
      ),
    },
    {
      header: 'Training Status',
      cell: (item) => getTrainingStatusBadge(item.trainingStatus),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenStudentProfile(item.studentPublicId, item.studentName)}
            title="View Academic Profile"
            className="text-slate-500 hover:text-emerald-600"
          >
            <Info className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleUnlink(item.studentPublicId);
            }}
            title="Unlink Trainee"
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('nav.traineeRoster', 'Trainees Roster')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage active trainees, view academic performance, monitor internship periods, and assign new students
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrainees}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setLinkModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-md"
          >
            Assign New Trainee
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-emerald-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Trainees</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">assigned students</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-teal-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-teal-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Placements</span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</span>
            <span className="text-xs text-teal-600 font-medium">currently training</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Training</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</span>
            <span className="text-xs text-indigo-600 font-medium">graduated</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800 border-amber-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Terminated / Other</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.other}</span>
            <span className="text-xs text-slate-400">records</span>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by student name, college, major, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({trainees.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Completed ({stats.completed})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('terminated')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'terminated'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Terminated ({stats.other})
          </button>
        </div>
      </div>

      {/* Trainees Table */}
      <Table
        columns={columns}
        data={filteredTrainees}
        keyExtractor={(item) => item.studentPublicId}
        isLoading={loading}
        onRowClick={(item) => handleOpenStudentProfile(item.studentPublicId, item.studentName)}
        emptyMessage={
          searchQuery
            ? 'No matching trainees found for your search query.'
            : 'No trainees assigned to your company yet. Use the Assign New Trainee button to link students.'
        }
      />

      {/* MODAL 1: Assign Trainee Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Assign Trainee to Company"
        maxWidth="lg"
      >
        <form onSubmit={handleLinkTrainee} className="space-y-4">
          <Input
            label="Student Public GUID / ID *"
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            value={studentPublicId}
            onChange={(e) => setStudentPublicId(e.target.value)}
            required
            helperText="The unique public identifier provided by the university student."
          />

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

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300">
            Assigning this student links them directly to your company roster, enabling them to fill and submit your evaluation reports.
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Assign Trainee
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Student Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Trainee Profile & Academic Information"
        maxWidth="lg"
      >
        {loadingProfile ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading trainee profile...</div>
        ) : selectedStudentProfile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-base shrink-0">
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
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
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
              <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {selectedStudentProfile.activeTraining.companyName || 'Assigned Company'}
                  </span>
                  <Badge variant="success">{selectedStudentProfile.activeTraining.trainingStatus}</Badge>
                </div>
                {selectedStudentProfile.activeTraining.startDate && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Period: {selectedStudentProfile.activeTraining.startDate} → {selectedStudentProfile.activeTraining.endDate || 'Ongoing'}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setProfileModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
