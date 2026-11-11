import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccessLogin?: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const { sendPasswordResetLink } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState<string>(initialEmail);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Masukkan alamat email terdaftar Anda.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await sendPasswordResetLink(email);
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal mengirim tautan reset. Periksa kembali email Anda.');
      } else {
        success('Tautan terkirim', `Tautan reset kata sandi dikirim ke ${email}.`);
        setIsSent(true);
        setCountdown(60);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-backdrop animate-fade">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lupa kata sandi"
        className="w-full max-w-md bg-panel text-ink border border-rule rounded-md animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 pl-5 pr-3 h-14 border-b border-rule">
          <h3 className="display text-xl">{isSent ? 'Periksa email Anda' : 'Lupa kata sandi'}</h3>
          <button onClick={onClose} className="icon-btn" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {errorMsg && (
            <div role="alert" className="notice notice-danger">
              {errorMsg}
            </div>
          )}

          {!isSent ? (
            <form onSubmit={handleSendResetLink} className="space-y-4">
              <p className="text-sm text-ink-2">
                Masukkan email akun Anda. Kami kirimkan tautan untuk membuat kata sandi baru.
              </p>
              <div>
                <label htmlFor="forgot-email" className="label">
                  Email akun
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="field field-lg"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-lg btn-block btn-primary">
                {isLoading ? 'Mengirim…' : 'Kirim tautan'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="notice notice-ok">
                Tautan dikirim ke <strong>{email}</strong>. Buka email tersebut dan ikuti tautan reset di
                dalamnya. Jika belum muncul dalam satu menit, periksa folder spam atau promosi.
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="font-medium text-ink-2 hover:text-ink underline underline-offset-2"
                >
                  Ganti email
                </button>

                <button
                  type="button"
                  disabled={countdown > 0 || isLoading}
                  onClick={handleSendResetLink}
                  className="font-medium text-ink hover:opacity-80 disabled:text-ink-3 tabular-nums"
                >
                  {countdown > 0 ? `Kirim ulang dalam ${countdown} dtk` : 'Kirim ulang'}
                </button>
              </div>

              <button type="button" onClick={onClose} className="btn btn-lg btn-block btn-secondary">
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
