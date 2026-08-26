import React from 'react';
import { AlertTriangle, LogOut, Trash2, HelpCircle } from 'lucide-react';

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
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'danger',
  iconType = 'warning',
}) => {
  if (!isOpen) return null;

  let Icon = AlertTriangle;
  let iconBg = 'bg-rose-500/15 text-rose-500 border-rose-500/30';
  let confirmBtnBg = 'bg-rose-600 hover:bg-rose-500 text-white';

  if (iconType === 'logout') {
    Icon = LogOut;
    iconBg = 'bg-rose-500/15 text-rose-500 border-rose-500/30';
  } else if (iconType === 'delete') {
    Icon = Trash2;
    iconBg = 'bg-rose-500/15 text-rose-500 border-rose-500/30';
  } else if (iconType === 'info') {
    Icon = HelpCircle;
    iconBg = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    confirmBtnBg = 'bg-blue-600 hover:bg-blue-500 text-white';
  }

  if (type === 'warning') {
    iconBg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    confirmBtnBg = 'bg-amber-600 hover:bg-amber-500 text-white';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white tracking-tight leading-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-zinc-400 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 ${confirmBtnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
