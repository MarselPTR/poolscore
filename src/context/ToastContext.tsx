import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = 'info', duration = 3500) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast(title, message, 'success'), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast(title, message, 'error'), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast(title, message, 'info'), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast(title, message, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Floating Toast Notification Stack (Centered Top / Mobile-Friendly) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none select-none">
        {toasts.map((toast) => {
          let accentClass = 'border-l-ink-3';
          let icon = <Info className="w-[18px] h-[18px] text-ink-2 shrink-0 mt-0.5" />;

          if (toast.type === 'success') {
            accentClass = 'border-l-ok';
            icon = <CheckCircle2 className="w-[18px] h-[18px] text-ok shrink-0 mt-0.5" />;
          } else if (toast.type === 'error') {
            accentClass = 'border-l-danger';
            icon = <AlertCircle className="w-[18px] h-[18px] text-danger shrink-0 mt-0.5" />;
          } else if (toast.type === 'warning') {
            accentClass = 'border-l-warn';
            icon = <AlertTriangle className="w-[18px] h-[18px] text-warn shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto py-3 pl-3 pr-2 bg-panel text-ink border border-rule border-l-[3px] rounded-[4px] shadow-lg flex items-start gap-2.5 animate-rise ${accentClass}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-snug">{toast.title}</div>
                {toast.message && (
                  <div className="text-[13px] text-ink-2 mt-0.5 leading-snug">{toast.message}</div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="icon-btn !w-7 !h-7"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
