import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Clock, XCircle, Sun, Moon } from 'lucide-react';

/** Shown to a venue admin whose account is not yet approved (or rejected). */
export const PendingApprovalScreen: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useSettings();

  const rejected = user?.approvalStatus === 'rejected';

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <header className="h-14 border-b border-rule flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="w-7 h-7 rounded-[4px] object-contain" />
          <span className="display text-[22px] tracking-wide">PoolScore</span>
        </div>
        <button onClick={toggleTheme} className="icon-btn" aria-label="Ganti tema">
          {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-14 h-14 rounded-full border border-rule-strong flex items-center justify-center mb-5">
            {rejected ? (
              <XCircle className="w-7 h-7 text-danger" />
            ) : (
              <Clock className="w-7 h-7 text-warn" />
            )}
          </div>

          <h1 className="display text-3xl">
            {rejected ? 'Pendaftaran ditolak' : 'Menunggu persetujuan'}
          </h1>

          <p className="mt-3 text-ink-2 leading-relaxed">
            {rejected ? (
              <>Pendaftaran akun pengelola tempat Anda tidak disetujui. Hubungi Super Admin untuk informasi lebih lanjut.</>
            ) : (
              <>
                Akun pengelola tempat <strong className="text-ink">{user?.venueName || user?.name}</strong> sedang
                ditinjau oleh Super Admin. Anda akan bisa mengelola meja dan turnamen setelah disetujui.
              </>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            {!rejected && (
              <button onClick={refreshProfile} className="btn btn-lg btn-primary btn-block">
                Periksa status
              </button>
            )}
            <button onClick={logout} className="btn btn-lg btn-secondary btn-block">
              Keluar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
