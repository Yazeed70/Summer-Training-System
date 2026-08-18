import { create } from 'zustand';

export interface ErrorModalOptions {
  title?: string;
  message: string;
  errorCode?: string;
  traceId?: string;
  status?: number;
  details?: string;
  validationErrors?: string[];
  confirmText?: string;
  onClose?: () => void;
  onRetry?: () => void;
}

interface ErrorModalState {
  isOpen: boolean;
  currentError: ErrorModalOptions | null;
  queue: ErrorModalOptions[];
  showError: (options: ErrorModalOptions) => void;
  closeError: () => void;
  clearAll: () => void;
}

export const useErrorModalStore = create<ErrorModalState>((set, get) => ({
  isOpen: false,
  currentError: null,
  queue: [],

  showError: (options: ErrorModalOptions) => {
    const { isOpen, currentError, queue } = get();

    // Check for identical duplicate errors to prevent duplicate spamming
    const isDuplicateOfCurrent =
      isOpen &&
      currentError?.message === options.message &&
      currentError?.errorCode === options.errorCode;

    const isDuplicateInQueue = queue.some(
      (item) => item.message === options.message && item.errorCode === options.errorCode
    );

    if (isDuplicateOfCurrent || isDuplicateInQueue) {
      return; // Deduplicate identical concurrent errors
    }

    // If modal is not currently open, open it directly
    if (!isOpen) {
      set({
        isOpen: true,
        currentError: options,
      });
      return;
    }

    // If modal is already open, queue subsequent distinct errors (Locking / Queueing)
    // Limit queue size to 3 to prevent excessive popups
    if (queue.length < 3) {
      set({
        queue: [...queue, options],
      });
    }
  },

  closeError: () => {
    const { queue, currentError } = get();

    // Call callback of closed error if present
    if (currentError?.onClose) {
      try {
        currentError.onClose();
      } catch (err) {
        console.error('Error in error modal onClose callback:', err);
      }
    }

    // If there are more errors in the queue, show the next one smoothly
    if (queue.length > 0) {
      const [nextError, ...remainingQueue] = queue;
      set({
        isOpen: true,
        currentError: nextError,
        queue: remainingQueue,
      });
    } else {
      // Otherwise close modal completely
      set({
        isOpen: false,
        currentError: null,
      });
    }
  },

  clearAll: () => {
    set({
      isOpen: false,
      currentError: null,
      queue: [],
    });
  },
}));

/**
 * Standalone helper to trigger the error modal from non-React contexts (e.g. Axios interceptors)
 */
export const showErrorModal = (options: ErrorModalOptions): void => {
  useErrorModalStore.getState().showError(options);
};

export const closeErrorModal = (): void => {
  useErrorModalStore.getState().closeError();
};
