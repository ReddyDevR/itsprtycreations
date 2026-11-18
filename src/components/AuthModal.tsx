'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'customer' | 'admin';
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setNotice(null);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      if (!data.user) throw new Error('Invalid login response from server');

      login(data.user);
      onClose();
      if (data.user.role === 'ADMIN') {
        window.location.href = '/admin';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      if (!data.user) throw new Error('Invalid registration response from server');

      login(data.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice('Password recovery is not configured on this website yet. Please contact customer support.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[95vh] w-full max-w-md overflow-y-auto rounded-2xl border border-rose-100 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-500 transition hover:bg-white hover:text-gray-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 px-6 pb-6 pt-7 text-center text-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <Sparkles className="h-6 w-6 text-amber-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">ITSPRTYCREATIONS</h2>
          <p className="mt-1 text-xs text-rose-100">LTS Party Creations Online Shopping Portal</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-rose-100">
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            Secure &amp; Trusted Shopping Experience
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {mode !== 'forgot' && (
            <div className="mb-6 flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 border-b-2 pb-3 text-sm font-semibold ${mode === 'login' ? 'border-rose-600 text-rose-700' : 'border-transparent text-gray-400'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 border-b-2 pb-3 text-sm font-semibold ${mode === 'register' ? 'border-rose-600 text-rose-700' : 'border-transparent text-gray-400'}`}
              >
                Create Account
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-6">
              <button type="button" onClick={() => switchMode('login')} className="mb-4 text-sm font-medium text-rose-700 hover:text-rose-900">
                ← Back to Sign In
              </button>
              <h3 className="text-2xl font-bold text-gray-900">Forgot Password?</h3>
              <p className="mt-1 text-sm text-gray-500">Enter your registered email address.</p>
            </div>
          )}

          {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {notice && <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{notice}</div>}

          {mode === 'login' && (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Welcome Back!</h3>
                <p className="mt-1 text-sm text-gray-500">Sign in to continue shopping with us.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                    <input id="login-email" type="email" required autoComplete="email" placeholder="yourname@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-semibold text-gray-700">Password</label>
                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs font-semibold text-rose-600 hover:text-rose-800">Forgot Password?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                    <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-12 text-sm text-gray-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-700">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-rose-800 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:from-rose-900 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Signing In...' : 'SIGN IN'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => switchMode('register')} className="font-bold text-rose-700 hover:text-rose-900">Create Account</button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create Your Account</h3>
                <p className="mt-1 text-sm text-gray-500">Join us and discover beautiful celebrations.</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-gray-700">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                    <input id="register-name" type="text" required minLength={2} maxLength={80} autoComplete="name" placeholder="Enter your full name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-phone" className="mb-2 block text-sm font-semibold text-gray-700">Mobile Number <span className="font-normal text-gray-400">(Optional)</span></label>
                  <input id="register-phone" type="tel" autoComplete="tel" placeholder="+44 7700 900123" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                </div>
                <div>
                  <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                    <input id="register-email" type="email" required autoComplete="email" placeholder="yourname@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-gray-700">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                    <input id="register-password" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={128} autoComplete="new-password" placeholder="Minimum 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-12 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-700">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-rose-800 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:from-rose-900 hover:to-rose-700 disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
                </button>
              </form>
              <p className="mt-5 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-bold text-rose-700 hover:text-rose-900">Sign In</button>
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="mb-2 block text-sm font-semibold text-gray-700">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input id="forgot-email" type="email" required placeholder="yourname@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-rose-800 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200">RESET PASSWORD</button>
            </form>
          )}

          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Your account and information are protected.
            </p>
            <p className="mt-3 text-center text-[11px] text-gray-400">© {new Date().getFullYear()} ITSPRTYCREATIONS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
