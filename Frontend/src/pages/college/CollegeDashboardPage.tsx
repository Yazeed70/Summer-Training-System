import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Building2,
  Upload,
  FileText,
  Trash2,
  Search,
  ExternalLink,
  Eye,
  Clock,
  BookOpen,
} from 'lucide-react';
import { collegeService } from '../../api/collegeService';
import { CollegeDetailsDto, CollegeDocumentDto } from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { FileViewerModal } from '../../components/ui/FileViewerModal';

export const CollegeDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CollegeDetailsDto | null>(null);
  const [documents, setDocuments] = useState<CollegeDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Document Search & Viewer state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [viewingTitle, setViewingTitle] = useState('College_Document');
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await collegeService.getCollegeProfile();
      setProfile(res);
    } catch (err) {
      console.error('Failed to load college profile:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docs = await collegeService.getDocuments();
      setDocuments(docs || []);
    } catch (err) {
      console.error('Failed to load college documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchDocuments()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFile) {
      toast.error('Document title and file are required');
      return;
    }
    try {
      setUploading(true);
      await collegeService.uploadCollegeDocument({ title: docTitle.trim(), file: docFile });
      toast.success('College document uploaded successfully');
      setDocTitle('');
      setDocFile(null);
      // Reset file input element
      const fileInput = document.getElementById('college-doc-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await fetchDocuments();
      await fetchProfile();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.devMessage || err.response?.data?.message || 'Failed to upload document.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDeletingDocId(docId);
      await collegeService.deleteCollegeDocument(docId);
      toast.success('Document removed successfully');
      await fetchDocuments();
      await fetchProfile();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.devMessage || err.response?.data?.message || 'Failed to delete document.';
      toast.error(msg);
    } finally {
      setDeletingDocId(null);
    }
  };

  const handlePreviewDocument = (docId: number, title: string) => {
    setViewingDocId(docId);
    setViewingTitle(title || 'College_Document');
    setViewerOpen(true);
  };

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const getFileExtension = (filePath?: string) => {
    if (!filePath) return 'PDF';
    const ext = filePath.split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  };

  const documentColumns: Column<CollegeDocumentDto>[] = [
    {
      header: '#',
      className: 'w-12 text-center text-xs text-slate-400',
      cell: (_, idx?: number) => (
        <span className="font-mono text-xs text-slate-400">
          {(idx ?? 0) + 1}
        </span>
      ),
    },
    {
      header: 'Document Title',
      className: 'min-w-[220px]',
      cell: (doc) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</p>
            <p className="text-[10px] text-slate-400 font-mono line-clamp-1">ID: #{doc.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Format',
      className: 'w-24',
      cell: (doc) => {
        const ext = getFileExtension(doc.filePath);
        return (
          <Badge variant={ext === 'PDF' ? 'danger' : ext === 'DOC' || ext === 'DOCX' ? 'info' : 'neutral'} size="sm">
            {ext}
          </Badge>
        );
      },
    },
    {
      header: 'Uploaded Date',
      className: 'w-44 text-xs text-slate-500 dark:text-slate-400',
      cell: (doc) => (
        <div className="space-y-0.5">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
          </p>
          <p className="text-[10px] text-slate-400">
            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'w-36 text-right',
      cell: (doc) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-500" />}
            onClick={() => handlePreviewDocument(doc.id, doc.title)}
            title="Preview Document"
          >
            View
          </Button>

          <Button
            size="sm"
            variant="ghost"
            isLoading={deletingDocId === doc.id}
            onClick={() => handleDeleteDocument(doc.id)}
            title="Delete Document"
            className="hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('nav.dashboard')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            College profile management, student enrollment oversight & summer training guidelines documentation
          </p>
        </div>
      </div>

      {/* Top Grid: Profile Info & Upload Document */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="md:col-span-1 space-y-4">
          <div
            onClick={() => navigate('/college/profile')}
            className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-all"
            title="Click to manage college information"
          >
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white rounded-xl transition-all shadow-xs shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5 truncate">
                <span className="truncate">{profile?.name || 'My College'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity shrink-0" />
              </h2>
              <p className="text-xs text-slate-400">{profile?.code ? `Code: ${profile.code}` : 'Manage College Profile →'}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-slate-400">City / Address</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.city || profile?.address || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400">Contact Email</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.contactEmail || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400">Enrolled Students</p>
              <p className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xl mt-0.5">{profile?.totalStudents ?? 0}</p>
            </div>
          </div>
        </Card>

        {/* Upload Academic Guideline Document */}
        <Card className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Upload className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Academic Guideline Document</h3>
          </div>

          <form onSubmit={handleUploadDocument} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Document Title *"
                placeholder="e.g. Summer Training Guidelines & Syllabus 2026"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select File (PDF, DOCX, IMG) *
                </label>
                <input
                  id="college-doc-file-input"
                  type="file"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-indigo-400"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-400">
                Uploaded guidelines are instantly accessible to all students enrolled in your college.
              </p>
              <Button type="submit" isLoading={uploading} size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                Upload Document
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Bottom Section: Uploaded Documents Table */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Uploaded College Documents & Guidelines</h3>
              <Badge variant="indigo" size="sm">
                {documents.length} Total
              </Badge>
            </div>

            {documents.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search uploaded documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        }
      >
        <Table<CollegeDocumentDto>
          columns={documentColumns}
          data={filteredDocuments}
          keyExtractor={(doc) => doc.id}
          isLoading={loadingDocs}
          emptyMessage={
            searchQuery
              ? 'No documents matching your search criteria.'
              : 'No college guideline documents uploaded yet. Use the upload form above to add training manuals or syllabus forms.'
          }
        />
      </Card>

      {/* Document Viewer Modal */}
      {viewerOpen && viewingDocId && (
        <FileViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setViewingDocId(null);
          }}
          title="College Document Preview"
          fileName={viewingTitle}
          fetchBlob={() => collegeService.downloadCollegeDocumentBlob(viewingDocId)}
        />
      )}
    </div>
  );
};

