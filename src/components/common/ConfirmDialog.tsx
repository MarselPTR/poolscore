import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  iconType?: 'logout' | 'delete' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  type = 'danger',
  iconType = 'warning',
}) => {
  if (!isOpen) return null;

  let confirmClass = 'btn-danger-solid';
  if (type === 'warning') confirmClass = 'btn-warn';
  if (type === 'info' || iconType === 'info') confirmClass = 'btn-primary';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-backdrop animate-fade">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm bg-panel text-ink border border-rule rounded-md p-5 animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="display text-xl">{title}</h3>
        <p className="mt-2 text-sm text-ink-2 leading-relaxed">{message}</p>

        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn flex-1 ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
