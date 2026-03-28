import { toast, Slide } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

// Unified toast configuration
const defaultToastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  transition: Slide,
  style: {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
};

// Custom toast notification wrapper with icons and better styling
export const notify = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(
      <div className="flex items-center gap-3">
        <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
        <span className="text-[#fdfaf6] font-medium">{message}</span>
      </div>,
      {
        ...defaultToastConfig,
        ...options,
        className: 'bg-[#2b1e16] border-l-4 border-green-500',
        progressClassName: 'bg-green-500',
      }
    );
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(
      <div className="flex items-center gap-3">
        <FiXCircle className="text-red-500 text-xl flex-shrink-0" />
        <span className="text-[#fdfaf6] font-medium">{message}</span>
      </div>,
      {
        ...defaultToastConfig,
        autoClose: 5000, // Error messages stay longer
        ...options,
        className: 'bg-[#2b1e16] border-l-4 border-red-500',
        progressClassName: 'bg-red-500',
      }
    );
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(
      <div className="flex items-center gap-3">
        <FiAlertCircle className="text-amber-500 text-xl flex-shrink-0" />
        <span className="text-[#fdfaf6] font-medium">{message}</span>
      </div>,
      {
        ...defaultToastConfig,
        ...options,
        className: 'bg-[#2b1e16] border-l-4 border-amber-500',
        progressClassName: 'bg-amber-500',
      }
    );
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(
      <div className="flex items-center gap-3">
        <FiInfo className="text-blue-500 text-xl flex-shrink-0" />
        <span className="text-[#fdfaf6] font-medium">{message}</span>
      </div>,
      {
        ...defaultToastConfig,
        ...options,
        className: 'bg-[#2b1e16] border-l-4 border-blue-500',
        progressClassName: 'bg-blue-500',
      }
    );
  },

  // Loading notification that returns a toast ID for updating
  loading: (message: string) => {
    return toast.loading(
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
        <span className="text-[#fdfaf6] font-medium">{message}</span>
      </div>,
      {
        ...defaultToastConfig,
        autoClose: false,
        className: 'bg-[#2b1e16] border-l-4 border-amber-600',
      }
    );
  },

  // Update existing toast (useful for loading -> success/error)
  update: (toastId: any, type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const icons = {
      success: <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />,
      error: <FiXCircle className="text-red-500 text-xl flex-shrink-0" />,
      warning: <FiAlertCircle className="text-amber-500 text-xl flex-shrink-0" />,
      info: <FiInfo className="text-blue-500 text-xl flex-shrink-0" />,
    };

    const colors = {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-amber-500',
      info: 'border-blue-500',
    };

    const progressColors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-amber-500',
      info: 'bg-blue-500',
    };

    toast.update(toastId, {
      render: (
        <div className="flex items-center gap-3">
          {icons[type]}
          <span className="text-[#fdfaf6] font-medium">{message}</span>
        </div>
      ),
      type: type,
      isLoading: false,
      autoClose: 4000,
      className: `bg-[#2b1e16] border-l-4 ${colors[type]}`,
      progressClassName: progressColors[type],
    });
  },

  // Promise-based notification (useful for async operations)
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    }
  ): Promise<T> => {
    const toastId = notify.loading(messages.pending);

    try {
      const result = await promise;
      notify.update(toastId, 'success', messages.success);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || messages.error;
      notify.update(toastId, 'error', errorMessage);
      throw error;
    }
  },
};

// ToastContainer configuration component
export const AppToastContainer = () => {
  return null; // The actual ToastContainer should be in root.tsx
};

// Export default config for manual ToastContainer usage
export const toastContainerConfig = {
  position: 'top-right' as const,
  autoClose: 4000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  target: 'html', // Applying to higher level if needed
  theme: 'dark' as const,
  transition: Slide,
  style: {
    top: '80px', // Below header
  },
  toastStyle: {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
};