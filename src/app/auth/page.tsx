'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [customerMode, setCustomerMode] = useState<'otp' | 'password' | 'register'>('otp');

  // Form states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Admin states
  const [adminEmail, setAdminEmail] = useState('admin@itsprtycreations.com');
  const [adminPassword, setAdminPassword] = useState('Admin@12345');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in
  if (user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-100 shadow-lg text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Signed In as {user.name}</h2>
        <p className="text-xs text-gray-500">
          Account Email: <b>{user.email}</b> &bull; Role: <b>{user.role}</b>
        </p>
        <div className="flex flex-col gap-2 pt-2">
          {isAdmin ? (
            <button
              onClick={() => router.push('/admin')}
              className="py-2.5 bg-amber-500 text-white font-bold text-xs uppercase rounded-xl hover:bg-amber-600 transition-all shadow-md"
            >
              Open Admin Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/account')}
              className="py-2.5 bg-rose-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-rose-700 transition-all shadow-md"
            >
              Go to My Orders
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            className="py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Handle Mobile OTP Send
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch OTP');

      setOtpSent(true);
      setSuccess(`OTP sent to +91 ${phone}`);
      if (data.previewOtp) {
        setPreviewOtp(data.previewOtp);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile OTP Verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code');

      login(data.user);
      router.push('/account');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Email/Password Login
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.user);
      router.push('/account');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Registration
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      login(data.user);
      router.push('/account');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Portal Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Admin verification failed');

      login(data.user);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Simulation
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const googleMockUser = {
        email: 'priya.sharma@gmail.com',
        name: 'Priya Sharma',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        googleId: 'g_priya_sharma_9872',
      };
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleMockUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      login(data.user);
      router.push('/account');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-rose-100">
        {/* Header */}
        <div className="p-8 pb-6 bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-white/10 rounded-full border border-white/20">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">ITSPRTYCREATIONS</h1>
          <p className="text-xs text-rose-200 mt-1">LTS Party Creations &bull; Unified Login Portal</p>

          {/* Unified Navigation Tabs: Customer vs Admin on the Same Page */}
          <div className="mt-6 grid grid-cols-2 gap-2 bg-black/25 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('customer');
                setError(null);
                setSuccess(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'customer'
                  ? 'bg-white text-rose-950 shadow-md font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Customer Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setError(null);
                setSuccess(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-gray-950 shadow-md font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* CUSTOMER TAB */}
          {activeTab === 'customer' && (
            <div>
              <div className="flex border-b border-gray-100 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('otp');
                    setError(null);
                  }}
                  className={`flex-1 pb-2.5 text-xs font-medium border-b-2 transition-all ${
                    customerMode === 'otp'
                      ? 'border-rose-600 text-rose-700 font-bold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Mobile OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('password');
                    setError(null);
                  }}
                  className={`flex-1 pb-2.5 text-xs font-medium border-b-2 transition-all ${
                    customerMode === 'password'
                      ? 'border-rose-600 text-rose-700 font-bold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('register');
                    setError(null);
                  }}
                  className={`flex-1 pb-2.5 text-xs font-medium border-b-2 transition-all ${
                    customerMode === 'register'
                      ? 'border-rose-600 text-rose-700 font-bold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* 1. Mobile OTP */}
              {customerMode === 'otp' && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Mobile Number (10 digits)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs font-bold">
                            +91
                          </div>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          We will dispatch a secure 6-digit OTP code to your mobile.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || phone.length < 10}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-200 disabled:opacity-50"
                      >
                        {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-900">
                        Enter the 6-digit verification code sent to <b>+91 {phone}</b>
                        {previewOtp && (
                          <div className="mt-1 font-mono text-xs font-bold text-rose-700">
                            🔑 Verification Code: <span className="underline">{previewOtp}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center tracking-widest text-lg font-mono py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Your Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Priya Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-200 disabled:opacity-50"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP & Log In'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
                      >
                        Change mobile number
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* 2. Customer Email & Password */}
              {customerMode === 'password' && (
                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="customer@demo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        placeholder="Customer@123"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-200"
                  >
                    {loading ? 'Logging in...' : 'Sign In with Email'}
                  </button>
                </form>
              )}

              {/* 3. Customer Registration */}
              {customerMode === 'register' && (
                <form onSubmit={handleCustomerRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-200 mt-2"
                  >
                    {loading ? 'Creating Account...' : 'Complete Customer Registration'}
                  </button>
                </form>
              )}

              {/* Google Sign In Option */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          )}

          {/* ADMIN PORTAL TAB (Same Page!) */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Administrator Access Control</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Authorized staff only. Logging in here will open the full LTS Party Creations management dashboard.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Admin Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-gray-400">
                    Default admin: <code className="bg-gray-100 px-1 py-0.5 rounded">admin@itsprtycreations.com</code> / <code className="bg-gray-100 px-1 py-0.5 rounded">Admin@12345</code>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? 'Authenticating Admin...' : 'Authenticate & Open Admin Dashboard'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
