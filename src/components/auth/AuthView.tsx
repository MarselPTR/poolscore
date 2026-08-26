import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Phone,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register, loginAsGuest } = useAuth();
  const { isDarkMode, toggleTheme } = useSettings();
  const { warning, info } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'username'>('email');
  const [regMethod, setRegMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [role, setRole] = useState<'Pemain' | 'Wasit' | 'Pengelola Club'>('Pemain');

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
    if (!fullName.trim() || !regIdentifier.trim()) {
      const label = regMethod === 'email' ? 'Email' : 'Nomor HP';
      setErrorMsg(`Lengkapi Nama dan ${label} Anda`);
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await register(fullName, regIdentifier, password, role);
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal mendaftar. Coba lagi.');
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

  return (
    <div className="min-h-screen w-full bg-bg text-text select-none flex flex-col lg:flex-row overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* =========================================================================
          1. LEFT HALF: Full-Bleed Edge-to-Edge Artwork (No Box Frame)
          ========================================================================= */}
      <div className="relative w-full lg:w-1/2 h-72 sm:h-96 lg:h-screen shrink-0 overflow-hidden flex items-center justify-center bg-zinc-950">
        <img
          src="/login_bg.jpg"
          alt="Billiard Arena Artwork"
          className="w-full h-full object-cover object-center transform transition-transform duration-1000 hover:scale-105"
        />

        {/* Ambient Chromatic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/25 via-transparent to-blue-900/20 mix-blend-screen pointer-events-none" />

        {/* Seamless Edge Blends with Background */}
        <div className="lg:hidden absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg via-bg/80 to-transparent pointer-events-none" />
        <div className="hidden lg:block absolute inset-y-0 right-0 w-32 xl:w-48 bg-gradient-to-l from-bg via-bg/70 to-transparent pointer-events-none" />

        {/* Bottom Shadow Gradient for Pure Text Legibility */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        {/* Hero Pure Typography (No Badge Box or Sparkle Icons) */}
        <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10 z-10 max-w-lg space-y-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black hero-text drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-tight">
            PoolScore Championship
          </h2>
          <p className="text-xs sm:text-sm hero-subtext font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Papan skor biliar digital generasi terbaru dengan sistem rating Elo & manajemen turnamen biliar modern.
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. RIGHT HALF: Full-Bleed Seamless Form & Navigation
          ========================================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between px-6 py-6 sm:px-12 sm:py-10 lg:px-16 lg:py-12 z-20 bg-bg">
        
        {/* Top Navbar */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="PoolScore Logo"
              className="w-8 h-8 rounded-xl object-cover border border-line shadow-sm"
            />
            <span className="font-extrabold text-base tracking-tight text-text">
              PoolScore
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-surface-2 hover:bg-surface-hover text-text-dim hover:text-text border border-line transition-all active:scale-95 shadow-sm"
              title={isDarkMode ? 'Ganti ke Mode Siang' : 'Ganti ke Mode Malam'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </button>

            {/* Mode Switcher */}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-2 hover:bg-surface-hover text-text border border-line transition-all active:scale-95 shadow-sm"
            >
              {mode === 'login' ? 'Daftar' : 'Masuk'}
            </button>
          </div>
        </div>

        {/* Center Main Form */}
        <div className="my-auto py-6 max-w-md w-full mx-auto space-y-5">
          
          {/* Header Titles */}
          <div className="space-y-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text">
              {mode === 'login' ? 'Hello !' : 'Create Account'}
            </h1>
            <p className="text-sm font-semibold text-text-dim">
              {mode === 'login' ? 'Welcome Back' : 'Get started with PoolScore'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              {successMsg}
            </div>
          )}

          {/* FORM: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              
              {/* Dynamic In-Field Method Switcher & Input */}
              <div className="relative flex items-center">
                <input
                  type={loginMethod === 'email' ? 'email' : loginMethod === 'phone' ? 'tel' : 'text'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    loginMethod === 'email'
                      ? 'Enter Email'
                      : loginMethod === 'phone'
                      ? 'Enter Phone Number'
                      : 'Enter Username'
                  }
                  className="w-full pl-5 pr-24 py-3.5 bg-surface-2 border border-line rounded-2xl text-xs sm:text-sm font-semibold text-text placeholder-text-muted focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                  required
                />

                {/* In-Field Switcher Pill */}
                <div className="absolute right-1.5 flex items-center bg-surface-3 p-0.5 rounded-xl border border-line-strong shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('email');
                      setIdentifier('');
                      setErrorMsg('');
                    }}
                    title="Login via Email"
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                      loginMethod === 'email'
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'text-text-dim hover:text-text'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('phone');
                      setIdentifier('');
                      setErrorMsg('');
                    }}
                    title="Login via Nomor HP"
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                      loginMethod === 'phone'
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'text-text-dim hover:text-text'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('username');
                      setIdentifier('');
                      setErrorMsg('');
                    }}
                    title="Login via Username"
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                      loginMethod === 'username'
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'text-text-dim hover:text-text'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-5 pr-11 py-3.5 bg-surface-2 border border-line rounded-2xl text-xs sm:text-sm font-semibold text-text placeholder-text-muted focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 p-1 text-text-dim hover:text-text transition-colors"
                    title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 shrink-0" />
                    ) : (
                      <Eye className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                </div>

                <div className="text-right mt-1 pr-1">
                  <button
                    type="button"
                    onClick={() =>
                      info(
                        'Informasi Reset Kata Sandi',
                        'Petunjuk pemulihan kata sandi telah dikirimkan ke email atau akun Anda.'
                      )
                    }
                    className="text-[11px] text-text-dim hover:text-rose-500 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* High-Contrast Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl auth-submit-btn font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Processing...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </form>
          )}

          {/* FORM: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full pl-5 pr-11 py-3.5 bg-surface-2 border border-line rounded-2xl text-xs sm:text-sm font-semibold text-text placeholder-text-muted focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                  required
                />
                <User className="w-4 h-4 text-text-dim absolute right-4 pointer-events-none" />
              </div>

              {/* Dynamic In-Field Identifier for Register */}
              <div className="relative flex items-center">
                <input
                  type={regMethod === 'email' ? 'email' : 'tel'}
                  value={regIdentifier}
                  onChange={(e) => setRegIdentifier(e.target.value)}
                  placeholder={regMethod === 'email' ? 'Email Address' : 'Phone Number'}
                  className="w-full pl-5 pr-20 py-3.5 bg-surface-2 border border-line rounded-2xl text-xs sm:text-sm font-semibold text-text placeholder-text-muted focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                  required
                />

                {/* Sleek In-Field Switcher for Register */}
                <div className="absolute right-1.5 flex items-center bg-surface-3 p-0.5 rounded-xl border border-line-strong shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setRegMethod('email');
                      setRegIdentifier('');
                      setErrorMsg('');
                    }}
                    title="Daftar via Email"
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                      regMethod === 'email'
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'text-text-dim hover:text-text'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegMethod('phone');
                      setRegIdentifier('');
                      setErrorMsg('');
                    }}
                    title="Daftar via Nomor HP / WhatsApp"
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                      regMethod === 'phone'
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'text-text-dim hover:text-text'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password"
                  className="w-full pl-5 pr-11 py-3.5 bg-surface-2 border border-line rounded-2xl text-xs sm:text-sm font-semibold text-text placeholder-text-muted focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1 text-text-dim hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 shrink-0" /> : <Eye className="w-4 h-4 shrink-0" />}
                </button>
              </div>

              {/* Role Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {(['Pemain', 'Wasit', 'Pengelola Club'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 rounded-xl border text-center text-xs font-semibold transition-all ${
                      role === r
                        ? 'border-rose-500 bg-rose-600 text-white shadow-sm font-bold'
                        : 'border-line bg-surface-2 text-text-dim hover:text-text'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Submit Register */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl auth-submit-btn font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Creating...' : 'Sign Up'}</span>
                <Sparkles className="w-4 h-4 shrink-0" />
              </button>
            </form>
          )}

          {/* Perfectly Centered Divider with Symmetrical Left & Right Lines */}
          <div className="flex items-center gap-3 w-full my-2">
            <div className="h-px bg-line flex-1" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-text-dim shrink-0 select-none">
              Or continue with
            </span>
            <div className="h-px bg-line flex-1" />
          </div>

          {/* Google Sign-In Pill Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-5 rounded-2xl bg-surface-2 hover:bg-surface-hover border border-line flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-text transition-all active:scale-[0.98] shadow-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="text-text font-semibold">Continue with Google</span>
          </button>

          {/* Quick Guest Access Link */}
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={loginAsGuest}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-dim hover:text-amber-500 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Masuk Cepat sebagai Tamu</span>
            </button>
          </div>

          {/* Toggle Link */}
          <div className="text-center text-xs text-text-dim pt-0.5">
            {mode === 'login' ? (
              <span>
                Don't have an account ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="font-bold text-text hover:text-rose-500 transition-colors ml-0.5"
                >
                  Create Account!
                </button>
              </span>
            ) : (
              <span>
                Already have an account ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-text hover:text-rose-500 transition-colors ml-0.5"
                >
                  Sign In!
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Footer with Copyright Notice & NugrahaTech Innovations */}
        <div className="w-full text-center space-y-1 pt-6 pb-2 border-t border-line/40 mt-4">
          <div className="text-[11px] font-medium text-text-dim">
            &copy; {new Date().getFullYear()} PoolScore Championship Suite. All Rights Reserved.
          </div>
          <div className="text-[10px] text-text-muted font-mono tracking-wide">
            Engineered &amp; Maintained by <span className="font-semibold text-rose-500">NugrahaTech Innovations</span>
          </div>
        </div>
      </div>

    </div>
  );
};
