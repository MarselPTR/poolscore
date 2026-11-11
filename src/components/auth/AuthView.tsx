import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { ResetPasswordDirectModal } from './ResetPasswordDirectModal';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register, loginAsGuest } = useAuth();
  const { isDarkMode, toggleTheme } = useSettings();
  const { warning } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'username'>('email');
  const [regMethod, setRegMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [role, setRole] = useState<'participant' | 'venue_admin'>('participant');
  const [venueName, setVenueName] = useState('');
  const [venueArea, setVenueArea] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      const label = loginMethod === 'email' ? 'Email' : loginMethod === 'phone' ? 'Nomor HP' : 'Username';
      setErrorMsg(`Masukkan ${label} Anda`);
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal masuk. Periksa kembali akun dan kata sandi Anda.');
      }
    } catch {
      setErrorMsg('Gagal masuk. Periksa kembali koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !regUsername.trim() || !regIdentifier.trim()) {
      const label = regMethod === 'email' ? 'Email' : 'Nomor HP';
      setErrorMsg(`Lengkapi Nama Lengkap, Username, dan ${label} Anda`);
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter agar akun Anda lebih aman.');
      return;
    }

    if (role === 'venue_admin' && (!venueName.trim() || !venueArea.trim())) {
      setErrorMsg('Lengkapi nama tempat billiard dan daerahnya.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await register({
        name: fullName,
        emailOrPhone: regIdentifier,
        password,
        role,
        username: regUsername,
        venue: role === 'venue_admin' ? { name: venueName.trim(), area: venueArea.trim() } : undefined,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal mendaftar. Coba lagi.');
      } else if (role === 'venue_admin') {
        setSuccessMsg('Pendaftaran terkirim! Akun pengelola menunggu persetujuan Super Admin.');
      } else {
        setSuccessMsg('Pendaftaran berhasil! Mengarahkan ke dashboard...');
      }
    } catch {
      setErrorMsg('Gagal mendaftar. Periksa kembali koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    warning(
      'Fitur Dalam Pengembangan',
      'Login Google OAuth saat ini sedang dalam tahap pengembangan & integrasi. Silakan masuk menggunakan Email, Username, atau tombol Masuk Cepat sebagai Tamu.'
    );
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const loginMethods: { id: 'email' | 'phone' | 'username'; label: string }[] = [
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'No. HP' },
    { id: 'username', label: 'Username' },
  ];

  return (
    <div className="min-h-screen w-full bg-bg text-ink flex flex-col lg:flex-row">
      {/* Photograph */}
      <div className="relative w-full lg:w-[46%] h-44 sm:h-60 lg:h-auto lg:min-h-screen shrink-0 overflow-hidden bg-black">
        <img src="/login_bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 bottom-0 p-6 lg:p-12 text-white">
          <div className="flex h-1.5 w-16 mb-4 lg:mb-6">
            <span className="flex-1 bg-p1" />
            <span className="flex-1 bg-p2" />
          </div>
          <p className="display text-3xl sm:text-4xl lg:text-6xl max-w-md">
            Papan skor untuk meja biliar Anda
          </p>
          <p className="hidden lg:block mt-4 text-white/75 max-w-sm">
            Catat skor, pantau peringkat pemain, dan jalankan turnamen klub dari satu tempat.
          </p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex-1 flex flex-col px-6 py-6 sm:px-12 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="w-7 h-7 rounded-[4px] object-contain" />
            <span className="display text-[22px] tracking-wide">PoolScore</span>
          </div>
          <button
            onClick={toggleTheme}
            className="icon-btn"
            title={isDarkMode ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            aria-label={isDarkMode ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          >
            {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
        </div>

        <div className="my-auto py-8 w-full max-w-sm mx-auto">
          <h1 className="display text-4xl">{mode === 'login' ? 'Masuk' : 'Buat akun'}</h1>

          {/* Mode switch */}
          <div className="tabs mt-5">
            <button type="button" onClick={() => switchMode('login')} data-on={mode === 'login'} className="tab !pl-0">
              Sudah punya akun
            </button>
            <button type="button" onClick={() => switchMode('register')} data-on={mode === 'register'} className="tab">
              Akun baru
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {errorMsg && (
              <div role="alert" className="notice notice-danger">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div role="status" className="notice notice-ok">
                {successMsg}
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-id" className="text-[13px] font-medium text-ink-2">
                      Masuk dengan
                    </label>
                    <div className="flex gap-3">
                      {loginMethods.map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => {
                            setLoginMethod(m.id);
                            setIdentifier('');
                            setErrorMsg('');
                          }}
                          aria-pressed={loginMethod === m.id}
                          className={`text-[13px] font-semibold ${
                            loginMethod === m.id
                              ? 'text-ink underline underline-offset-4 decoration-2'
                              : 'text-ink-3 hover:text-ink'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    id="login-id"
                    type={loginMethod === 'email' ? 'email' : loginMethod === 'phone' ? 'tel' : 'text'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      loginMethod === 'email'
                        ? 'nama@email.com'
                        : loginMethod === 'phone'
                        ? '08xxxxxxxxxx'
                        : 'username'
                    }
                    autoComplete="username"
                    className="field field-lg"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-pw" className="text-[13px] font-medium text-ink-2">
                      Kata sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[13px] font-medium text-ink-2 hover:text-ink underline underline-offset-2"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-pw"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="field field-lg !pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-lg btn-block btn-primary">
                  {isLoading ? 'Memproses…' : 'Masuk'}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reg-name" className="label">
                    Nama lengkap
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="field field-lg"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-username" className="label">
                    Username
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="huruf kecil, angka, garis bawah"
                    autoComplete="username"
                    className="field field-lg"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="reg-contact" className="text-[13px] font-medium text-ink-2">
                      Kontak
                    </label>
                    <div className="flex gap-3">
                      {(
                        [
                          { id: 'email', label: 'Email' },
                          { id: 'phone', label: 'No. HP' },
                        ] as { id: 'email' | 'phone'; label: string }[]
                      ).map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => {
                            setRegMethod(m.id);
                            setRegIdentifier('');
                            setErrorMsg('');
                          }}
                          aria-pressed={regMethod === m.id}
                          className={`text-[13px] font-semibold ${
                            regMethod === m.id
                              ? 'text-ink underline underline-offset-4 decoration-2'
                              : 'text-ink-3 hover:text-ink'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    id="reg-contact"
                    type={regMethod === 'email' ? 'email' : 'tel'}
                    value={regIdentifier}
                    onChange={(e) => setRegIdentifier(e.target.value)}
                    placeholder={regMethod === 'email' ? 'nama@email.com' : '08xxxxxxxxxx'}
                    className="field field-lg"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-pw" className="label">
                    Kata sandi (minimal 8 karakter)
                  </label>
                  <div className="relative">
                    <input
                      id="reg-pw"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="field field-lg !pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="label">Daftar sebagai</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('participant')}
                      data-on={role === 'participant'}
                      className="opt"
                    >
                      <span>Peserta</span>
                      <span className="opt-sub">Main & ikut turnamen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('venue_admin')}
                      data-on={role === 'venue_admin'}
                      className="opt"
                    >
                      <span>Pengelola tempat</span>
                      <span className="opt-sub">Kelola meja & turnamen</span>
                    </button>
                  </div>
                </div>

                {role === 'venue_admin' && (
                  <div className="space-y-3 border-l-2 border-rule-strong pl-3">
                    <p className="text-[13px] text-ink-3">
                      Akun pengelola perlu disetujui Super Admin sebelum aktif.
                    </p>
                    <div>
                      <label htmlFor="reg-venue" className="label">
                        Nama tempat billiard
                      </label>
                      <input
                        id="reg-venue"
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="mis. Amorty Billiard"
                        className="field field-lg"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-area" className="label">
                        Daerah / kota
                      </label>
                      <input
                        id="reg-area"
                        type="text"
                        value={venueArea}
                        onChange={(e) => setVenueArea(e.target.value)}
                        placeholder="mis. Bandung"
                        className="field field-lg"
                        required
                      />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isLoading} className="btn btn-lg btn-block btn-primary">
                  {isLoading ? 'Membuat akun…' : 'Buat akun'}
                </button>
              </form>
            )}

            <div className="flex items-center gap-3">
              <div className="h-px bg-rule flex-1" />
              <span className="text-[13px] text-ink-3">atau</span>
              <div className="h-px bg-rule flex-1" />
            </div>

            <div className="space-y-2">
              <button type="button" onClick={handleGoogleLogin} className="btn btn-lg btn-block btn-secondary">
                <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Lanjutkan dengan Google
              </button>

              <button type="button" onClick={loginAsGuest} className="btn btn-lg btn-block btn-ghost">
                Masuk sebagai tamu
              </button>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-ink-3 text-center">
          &copy; {new Date().getFullYear()} PoolScore · NugrahaTech Innovations
        </p>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={identifier}
      />

      <ResetPasswordDirectModal />
    </div>
  );
};

