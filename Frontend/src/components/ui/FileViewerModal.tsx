import React, { useEffect, useState } from 'react';
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  fetchBlob?: () => Promise<Blob>;
  blobUrl?: string | null;
  fileName?: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  title = 'Document Viewer',
  fetchBlob,
  blobUrl: externalBlobUrl,
  fileName = 'document',
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let createdUrl: string | null = null;

    if (isOpen) {
      if (externalBlobUrl) {
        setObjectUrl(externalBlobUrl);
        setLoading(false);
        setError(null);
      } else if (fetchBlob) {
        setLoading(true);
        setError(null);
        fetchBlob()
          .then((blob) => {
            setMimeType(blob.type);
            createdUrl = URL.createObjectURL(blob);
            setObjectUrl(createdUrl);
          })
          .catch((err) => {
            console.error('Failed to load file blob:', err);
            setError('Failed to load document content. Please try again.');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }

    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, externalBlobUrl, fetchBlob]);

  const handleDownload = () => {
    if (!objectUrl) return;
    const link = document.createElement('a');
    link.href = objectUrl;
    const ext = mimeType.includes('png')
      ? '.png'
      : mimeType.includes('jpeg') || mimeType.includes('jpg')
      ? '.jpg'
      : mimeType.includes('pdf')
      ? '.pdf'
      : '';
    link.setAttribute('download', `${fileName}${ext}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isImage = mimeType.startsWith('image/') || externalBlobUrl?.match(/\.(jpg|jpeg|png|webp|gif)/i);
  const isPdf = mimeType.includes('pdf') || externalBlobUrl?.match(/\.pdf/i);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="6xl">
      <div className="space-y-4">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{fileName}</span>
          </div>

          {objectUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4 text-indigo-500" />}
            >
              Download Document
            </Button>
          )}
        </div>

        {/* Content Preview Container */}
        <div className="min-h-[50vh] max-h-[75vh] flex items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden relative">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400 text-xs py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span>Loading document viewer...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 text-rose-500 text-xs py-16 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && objectUrl && (
            <>
              {isImage ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={objectUrl}
                    alt={fileName}
                    className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
                  />
                </div>
              ) : isPdf ? (
                <iframe
                  src={objectUrl}
                  title={fileName}
                  className="w-full h-[72vh] rounded-xl border-0 bg-white"
                />
              ) : (
                <iframe
                  src={objectUrl}
                  title={fileName}
                  className="w-full h-[72vh] rounded-xl border-0 bg-white"
                />
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
