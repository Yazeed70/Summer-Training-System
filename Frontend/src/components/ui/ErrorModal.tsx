import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Check, Copy, RefreshCw, X, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  errorCode?: string;
  traceId?: string;
  status?: number;
  validationErrors?: string[];
  confirmText?: string;
  onRetry?: () => void;
  isLoading?: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message = 'An unexpected error occurred. Please try again.',
  errorCode,
  traceId,
  status,
  validationErrors,
  confirmText,
  onRetry,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = (i18n.language || 'ar').startsWith('ar');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyTraceId = () => {
    if (!traceId) return;
    navigator.clipboard.writeText(traceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine icon & color theme based on status code or error nature
  const isServerError = status === 500;
  const isWarning = status === 400 || status === 409;
  const isAccessError = status === 401 || status === 403;

  const defaultTitle = title || (isArabic ? 'تنبيه' : 'Notice');
  const defaultConfirmText = confirmText || (isArabic ? 'حسناً، فهمت' : 'Got it');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={twMerge(
          clsx(
            'relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all animate-in zoom-in-95 duration-200 overflow-hidden z-10'
          )
        )}
      >
        {/* Top Decorative accent line */}
        <div
          className={clsx(
            'h-1.5 w-full',
            isServerError && 'bg-gradient-to-r from-rose-500 to-red-600',
            isWarning && 'bg-gradient-to-r from-amber-500 to-orange-500',
            isAccessError && 'bg-gradient-to-r from-purple-500 to-indigo-600',
            !isServerError && !isWarning && !isAccessError && 'bg-gradient-to-r from-rose-500 to-orange-500'
          )}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={t('common.cancel')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Header with gentle Icon */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={clsx(
                'p-3 rounded-2xl shrink-0 transition-transform shadow-sm',
                isServerError && 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60',
                isWarning && 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60',
                isAccessError && 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60',
                !isServerError && !isWarning && !isAccessError && 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60'
              )}
            >
              {isServerError ? (
                <AlertCircle className="w-6 h-6" />
              ) : isWarning ? (
                <AlertTriangle className="w-6 h-6" />
              ) : isAccessError ? (
                <Info className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>

            <div className="pr-6 rtl:pr-0 rtl:pl-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {defaultTitle}
              </h3>
              {errorCode && (
                <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {errorCode}
                </span>
              )}
            </div>
          </div>

          {/* Gentle Message Content */}
          <div className="space-y-3 text-slate-600 dark:text-slate-300">
            <p className="text-sm leading-relaxed whitespace-pre-line font-medium">
              {message}
            </p>

            {/* Validation errors list if available */}
            {validationErrors && validationErrors.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isArabic ? 'يرجى مراجعة الملاحظات التالية:' : 'Please review the following notes:'}
                </p>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trace ID box for server issues */}
            {traceId && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {isArabic ? 'رمز تتبع الخطأ (Trace ID)' : 'Trace ID for Support'}
                  </span>
                  <span className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate">
                    {traceId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTraceId}
                  className="shrink-0 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-xs"
                  title={isArabic ? 'نسخ رمز التتبع' : 'Copy Trace ID'}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {onRetry && (
              <Button
                variant="outline"
                size="md"
                onClick={onRetry}
                disabled={isLoading}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                {isArabic ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-[90px]"
            >
              {defaultConfirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
