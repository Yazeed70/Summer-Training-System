import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Building2,
  Mail,
  Phone,
  BookOpen,
  FileText,
  ExternalLink,
  Clock,
  Award,
  IdCard,
  BookMarked,
  Info,
  Sparkles,
  Search,
} from 'lucide-react';
import { studentService } from '../../api/studentService';
import {
  StudentProfileResponseDto,
  CollegeAdvisorDto,
  CollegeDocumentDto,
} from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileViewerModal } from '../../components/ui/FileViewerModal';

export const StudentCollegePage: React.FC = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<StudentProfileResponseDto | null>(null);
  const [advisors, setAdvisors] = useState<CollegeAdvisorDto[]>([]);
  const [documents, setDocuments] = useState<CollegeDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDocQuery, setSearchDocQuery] = useState('');

  // Document Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [viewingTitle, setViewingTitle] = useState('College_Document');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profRes, advRes, docRes] = await Promise.all([
        studentService.getMyProfile().catch(() => null),
        studentService.getCollegeAdvisor().catch(() => []),
        studentService.getCollegeDocuments().catch(() => []),
      ]);
      setProfile(profRes);
      setAdvisors(advRes || []);
      setDocuments(docRes || []);
    } catch (err) {
      console.error('Failed to load college data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDoc = (docId: number, title: string) => {
    setViewingDocId(docId);
    setViewingTitle(title || 'College_Resource');
    setViewerOpen(true);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title?.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Academic Hub
              </span>
              {profile?.collegeName && (
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold">
                  {profile.collegeName}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile?.collegeName || 'My College & Academic Support'}
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Official training guidelines, academic coordinators, downloadable syllabus manuals, and evaluation criteria for your summer training.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Academic Advisors & Guidelines Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Academic Advisors & College Representatives */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Advisors & Support</h3>
              </div>
              <Badge variant="indigo" size="sm">
                {advisors.length} Assigned
              </Badge>
            </div>
          }
        >
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Clock className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
              <span>Loading advisors...</span>
            </div>
          ) : advisors.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <GraduationCap className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No designated advisors listed</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your college training coordinator will be listed here once assigned by the college administration.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {advisors.map((adv, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-base shadow-indigo-500/20 shadow-md shrink-0">
                      {adv.name?.charAt(0).toUpperCase() || 'A'}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{adv.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {adv.jobTitle || 'College Training Coordinator'}
                      </p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {adv.collegeName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                    {adv.email && (
                      <a
                        href={`mailto:${adv.email}`}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                        title={`Send email to ${adv.name}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Email</span>
                      </a>
                    )}

                    {adv.phoneNumber && (
                      <a
                        href={`tel:${adv.phoneNumber}`}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-600 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                        title={`Call ${adv.name}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right Column: College Guidelines & Resources */}
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Guidelines & Official Resources</h3>
                <Badge variant="neutral" size="sm">
                  {documents.length} Total
                </Badge>
              </div>

              {documents.length > 3 && (
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchDocQuery}
                    onChange={(e) => setSearchDocQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          }
        >
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Clock className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
              <span>Loading resources...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {searchDocQuery ? 'No matching resources found' : 'No guidelines documents uploaded'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchDocQuery
                  ? 'Try searching with a different term.'
                  : 'Training manuals, syllabus rubrics, and formal guidelines will appear here once uploaded by your college.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ExternalLink className="w-3.5 h-3.5 text-indigo-500" />}
                    onClick={() => handleViewDoc(doc.id, doc.title)}
                  >
                    View Document
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* College Information & Summer Training Advice Card */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Summer Training Academic Guidelines</h3>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Approval Requirement</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Every training request must be backed by an official acceptance letter from a registered company and reviewed by your college coordinator.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Periodic Reports</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Submit your periodic training reports on time through the Reports Hub so that your supervisor and college advisor can evaluate your progress.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Advisor Assistance</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Reach out to your assigned academic advisor via direct email or call if you encounter any difficulties during your internship placement.
            </p>
          </div>
        </div>
      </Card>

      {/* Document Viewer Modal */}
      {
        viewerOpen && viewingDocId && (
          <FileViewerModal
            isOpen={viewerOpen}
            onClose={() => {
              setViewerOpen(false);
              setViewingDocId(null);
            }}
            title="College Document Preview"
            fileName={viewingTitle}
            fetchBlob={() => studentService.downloadCollegeDocumentBlob(viewingDocId)}
          />
        )
      }
    </div >
  );
};
