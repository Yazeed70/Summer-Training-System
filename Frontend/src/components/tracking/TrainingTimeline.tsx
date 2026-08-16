import React from 'react';
import { CheckCircle2, Clock, XCircle, FileText, CheckCheck, Briefcase, GraduationCap } from 'lucide-react';
import { enRequestStatus, enTrainingStatus } from '../../types/enums';

interface TrainingTimelineProps {
  hasSubmittedRequest?: boolean;
  requestStatus?: enRequestStatus;
  trainingStatus?: enTrainingStatus;
  startDate?: string;
  endDate?: string;
}

export const TrainingTimeline: React.FC<TrainingTimelineProps> = ({
  hasSubmittedRequest = false,
  requestStatus,
  trainingStatus,
  startDate,
  endDate,
}) => {
  const hasRequest = hasSubmittedRequest || requestStatus !== undefined || trainingStatus === enTrainingStatus.Active || trainingStatus === enTrainingStatus.Completed;

  const isPending = hasRequest && requestStatus === enRequestStatus.Pending;
  const isRejected = hasRequest && requestStatus === enRequestStatus.Rejected;
  const isApproved = hasRequest && (requestStatus === enRequestStatus.Approved || trainingStatus === enTrainingStatus.Active || trainingStatus === enTrainingStatus.Completed);
  const isTrainingActive = trainingStatus === enTrainingStatus.Active;
  const isTrainingCompleted = trainingStatus === enTrainingStatus.Completed;

  const steps = [
    {
      title: 'Request Submitted',
      description: hasRequest ? 'Training request submitted to college' : 'No request submitted yet',
      isCompleted: hasRequest,
      isCurrent: false,
      isRejected: false,
      icon: FileText,
    },
    {
      title: isRejected ? 'Request Rejected' : 'College Review & Approval',
      description: !hasRequest
        ? 'Awaiting request submission'
        : isRejected
        ? 'Request was rejected by college'
        : isApproved
        ? 'Approved by college representative'
        : 'Under review by college representative',
      isCompleted: isApproved,
      isRejected: isRejected,
      isCurrent: isPending,
      icon: CheckCheck,
    },
    {
      title: 'Training Active',
      description: !isApproved
        ? 'Training period not started'
        : isTrainingCompleted
        ? 'Training period completed'
        : isTrainingActive
        ? `Active period (${startDate || ''} to ${endDate || ''})`
        : startDate
        ? `Ready to begin (${startDate})`
        : 'Ready to begin training',
      isCompleted: isTrainingCompleted,
      isRejected: false,
      isCurrent: isTrainingActive || (isApproved && !isTrainingCompleted),
      icon: Briefcase,
    },
    {
      title: 'Final Completion',
      description: isTrainingCompleted
        ? 'Training completed & evaluated'
        : 'Final evaluations pending',
      isCompleted: isTrainingCompleted,
      isRejected: false,
      isCurrent: isTrainingCompleted,
      icon: GraduationCap,
    },
  ];

  return (
    <div className="py-3">
      <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
        {steps.map((step, idx) => {
          const isLineActive = step.isCompleted;

          return (
            <div key={idx} className="flex-1 flex md:flex-col items-start md:items-center text-left md:text-center relative group">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`hidden md:block absolute top-4.5 left-1/2 w-full h-0.5 -z-0 transition-colors duration-300 ${
                    isLineActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}

              {/* Step Circle */}
              <div
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                  step.isRejected
                    ? 'bg-rose-500 text-white shadow-rose-500/25 shadow-lg ring-4 ring-rose-100 dark:ring-rose-950/50'
                    : step.isCompleted
                    ? 'bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg'
                    : step.isCurrent
                    ? 'bg-indigo-600 text-white shadow-indigo-500/25 shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-950/60 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {step.isRejected ? (
                  <XCircle className="w-5 h-5" />
                ) : step.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : step.isCurrent ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className="ml-4 md:ml-0 md:mt-3 space-y-0.5">
                <p className={`text-xs font-bold ${step.isRejected ? 'text-rose-600 dark:text-rose-400' : step.isCompleted || step.isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[170px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

