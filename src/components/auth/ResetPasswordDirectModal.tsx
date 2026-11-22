import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { passwordIssue } from '../../lib/password';
import { Eye, EyeOff } from 'lucide-react';

export const ResetPasswordDirectModal: React.FC = () => {
  const { isPasswordRecoveryMode, updateUserPassword, setIsPasswordRecoveryMode } = useAuth();
  const { success, error } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isPasswordRecoveryMode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwIssue = passwordIssue(newPassword);
    if (pwIssue) {
      setErrorMsg(pwIssue);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await updateUserPassword(newPassword);
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal menyimpan kata sandi baru.');
      } else {
        success('Kata sandi diperbarui', 'Kata sandi baru Anda sudah tersimpan.');
        setIsPasswordRecoveryMode(false);
      }
    } catch {
      error('Gagal', 'Terjadi kesalahan saat memperbarui kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-backdrop animate-fade">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Atur kata sandi baru"
        className="w-full max-w-md bg-panel text-ink border border-rule rounded-md animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center pl-5 pr-3 h-14 border-b border-rule">
          <h3 className="display text-xl">Kata sandi baru</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-ink-2">Tautan pemulihan valid. Buat kata sandi baru untuk akun Anda.</p>

          {errorMsg && (
            <div role="alert" className="notice notice-danger">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="new-pw" className="label">
              Kata sandi baru (min. 8 karakter, huruf &amp; angka)
            </label>
            <div className="relative">
              <input
                id="new-pw"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="field field-lg !pr-11"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-pw" className="label">
              Ulangi kata sandi baru
            </label>
            <input
              id="confirm-pw"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="field field-lg"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-lg btn-block btn-primary">
            {isLoading ? 'Menyimpan…' : 'Simpan dan masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};
