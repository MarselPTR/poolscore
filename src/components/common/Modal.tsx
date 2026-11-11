import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      <div className="fixed inset-0 bg-backdrop animate-fade" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-20 w-full ${maxWidth} bg-panel text-ink border border-rule sm:rounded-md max-h-[92vh] flex flex-col animate-rise`}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 pl-5 pr-3 h-14 border-b border-rule shrink-0">
            <h3 className="display text-xl truncate">{title}</h3>
            <button onClick={onClose} className="icon-btn" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );

  // Mount directly to document.body to prevent parent transform clipping or trapping
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
