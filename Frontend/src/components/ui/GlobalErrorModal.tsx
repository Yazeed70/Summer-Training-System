import React from 'react';
import { useErrorModalStore } from '../../store/useErrorModalStore';
import { ErrorModal } from './ErrorModal';

export const GlobalErrorModal: React.FC = () => {
  const { isOpen, currentError, closeError } = useErrorModalStore();

  if (!isOpen || !currentError) return null;

  return (
    <ErrorModal
      isOpen={isOpen}
      onClose={closeError}
      title={currentError.title}
      message={currentError.message}
      errorCode={currentError.errorCode}
      traceId={currentError.traceId}
      status={currentError.status}
      validationErrors={currentError.validationErrors}
      confirmText={currentError.confirmText}
      onRetry={currentError.onRetry}
    />
  );
};
