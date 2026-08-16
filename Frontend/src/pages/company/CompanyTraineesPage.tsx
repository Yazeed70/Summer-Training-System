import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Trash2,
  Calendar,
  Search,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  School,
  User,
  Info,
  Building2,
} from 'lucide-react';
import { companyService } from '../../api/companyService';
import { CompanyStudentsListDto, StudentProfileResponseDto } from '../../types/dashboard';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const CompanyTraineesPage: React.FC = () => {
  const { t } = useTranslation();
  const [trainees, setTrainees] = useState<CompanyStudentsListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [studentPublicId, setStudentPublicId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Student Profile Modal State
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfileResponseDto | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchTrainees = async () => {
    try {
      setLoading(true);
      const res = await companyService.getCompanyStudents();
      setTrainees(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, []);

  const handleLinkTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentPublicId) {
      toast.error('Student Public ID is required');
      return;
    }
    try {
      setSubmitting(true);
      await companyService.linkStudent({
        studentPublicId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      toast.success('Trainee assigned to company');
      setLinkModalOpen(false);
      setStudentPublicId('');
      setStartDate('');
      setEndDate('');
      fetchTrainees();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async (pubId: string) => {
    if (!window.confirm('Unlink trainee from company?')) return;
    try {
      await companyService.unlinkStudent(pubId);
      toast.success('Trainee unlinked');
      fetchTrainees();
    } catch (err) {
      console.error(err);
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

  const filteredTrainees = useMemo(() => {
    if (!searchQuery.trim()) return trainees;
    const q = searchQuery.toLowerCase();
    return trainees.filter(
      (t) =>
        t.studentName.toLowerCase().includes(q) ||
        (t.collegeName && t.collegeName.toLowerCase().includes(q)) ||
        (t.major && t.major.toLowerCase().includes(q))
    );
  }, [trainees, searchQuery]);

  const columns: Column<CompanyStudentsListDto>[] = [
    {
      header: 'Trainee Name',
      cell: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStudentProfile(item.studentPublicId, item.studentName);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view full student profile"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
            {item.studentName ? item.studentName.charAt(0).toUpperCase() : <GraduationCap className="w-4 h-4" />}
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
      header: 'College',
      cell: (item) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">{item.collegeName || '-'}</span>
      ),
    },
    {
      header: 'Major',
      cell: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">{item.major || 'Specialization'}</span>
      ),
    },
    {
      header: 'Training Status',
      cell: (item) => (
        <Badge variant={item.trainingStatus === 'Active' || (item.trainingStatus as any) === 2 ? 'success' : 'neutral'}>
          {item.trainingStatus || 'Active'}
        </Badge>
      ),
    },
    {
      header: t('common.actions'),
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenStudentProfile(item.studentPublicId, item.studentName)}
            title="View Details"
            className="text-slate-500 hover:text-indigo-600"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.traineeRoster')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage active trainees, view academic profiles, and assign internship periods
          </p>
        </div>

        <Button onClick={() => setLinkModalOpen(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
          Assign New Trainee
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by trainee name, ID, college, or major..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredTrainees}
        keyExtractor={(item) => item.studentPublicId}
        isLoading={loading}
        onRowClick={(item) => handleOpenStudentProfile(item.studentPublicId, item.studentName)}
        emptyMessage={searchQuery ? 'No matching trainees found.' : 'No trainees assigned to company yet.'}
      />

      {/* Assign Trainee Modal */}
      <Modal isOpen={linkModalOpen} onClose={() => setLinkModalOpen(false)} title="Assign Trainee to Company">
        <form onSubmit={handleLinkTrainee} className="space-y-4">
          <Input
            label="Student Public GUID / ID"
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            value={studentPublicId}
            onChange={(e) => setStudentPublicId(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Assign Trainee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Trainee Profile & Academic Information"
      >
        {loadingProfile ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading trainee profile...</div>
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
