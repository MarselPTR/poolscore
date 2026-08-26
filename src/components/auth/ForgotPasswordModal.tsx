import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, KeyRound, ArrowRight, CheckCircle2, RotateCcw, X } from 'lucide-react';

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
        success('Tautan Terkirim', `Tautan reset kata sandi telah dikirimkan ke ${email}.`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none font-sans">
      <div
        className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-white p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white tracking-tight">
              {isSent ? 'Tautan Reset Terkirim!' : 'Lupa Kata Sandi?'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isSent
                ? `Pesan pemulihan telah dikirim ke ${email}`
                : 'Masukkan email akun Anda untuk menerima tautan pemulihan.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium animate-shake">
            {errorMsg}
          </div>
        )}

        {!isSent ? (
          /* FORM: REQUEST RESET LINK */
          <form onSubmit={handleSendResetLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Alamat Email Akun
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors font-medium"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isLoading ? 'Mengirim Pesan...' : 'Kirim Tautan Pemulihan'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STATE: SENT SUCCESS INSTRUCTIONS */
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Email Berhasil Dikirimkan</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Silakan buka kotak masuk email <strong>{email}</strong> dan klik tombol <strong>"Reset password"</strong> di dalam email tersebut.
              </p>
              <p className="text-[11px] text-zinc-500 leading-normal">
                *Jika email belum muncul dalam 1 menit, periksa folder <em>Spam / Promosi</em>.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ganti Email
              </button>

              <button
                type="button"
                disabled={countdown > 0 || isLoading}
                onClick={handleSendResetLink}
                className="text-rose-400 hover:text-rose-300 font-semibold disabled:text-zinc-600 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Kirim Ulang (${countdown}s)` : 'Kirim Ulang Email'}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs transition-all active:scale-95"
            >
              Tutup Jendela Ini
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
