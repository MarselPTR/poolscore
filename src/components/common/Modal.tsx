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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      {/* 1. Backdrop Glass Blur like Homepage */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-modal-backdrop" 
        onClick={onClose} 
      />

      {/* 2. Elevated Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-20 w-full ${maxWidth} bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-zinc-800 text-white max-h-[90vh] flex flex-col animate-modal-card`}
      >
        {title && (
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-4 shrink-0">
            <h3 className="font-bold text-base sm:text-lg text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 shrink-0" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto pr-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  // Mount directly to document.body to prevent parent transform clipping or trapping
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
