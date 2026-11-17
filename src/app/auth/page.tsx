'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, user, isAdmin } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
          <ShieldCheck className="w-14 h-14 text-emerald-500 mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            You are already signed in.
          </p>

          <button
            onClick={() => router.push(isAdmin ? '/admin' : '/account')}
            className="mt-6 w-full py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const endpoint =
        mode === 'login'
          ? '/api/auth/login'
          : '/api/auth/register';

      const payload =
        mode === 'login'
          ? { email, password }
          : { name, email, phone, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (!data.user) {
        throw new Error('Invalid authentication response');
      }

      login(data.user);

      if (data.user.role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/account');
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-rose-50 via-white to-amber-50">

      <div className="w-full max-w-5xl bg-white rounded-[30px] shadow-2xl overflow-hidden border border-rose-100 grid md:grid-cols-2">

        {/* LEFT BRANDING SECTION */}

        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 text-white">

          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-8">
              <Sparkles className="w-7 h-7 text-amber-300" />
            </div>

            <h1 className="text-4xl font-serif font-bold leading-tight">
              Celebrate Every
              <span className="block text-amber-300">
                Special Moment.
              </span>
            </h1>

            <p className="text-rose-100 text-sm leading-7 mt-6">
              Discover beautiful handcrafted greeting cards,
              party stationery, invitations and personalized
              celebration collections at ITSPRTYCREATIONS.
            </p>
          </div>

          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-300" />

              <span className="text-xs text-rose-100">
                Secure and protected authentication
              </span>
            </div>

            <p className="text-[11px] text-rose-300 mt-4">
              ITSPRTYCREATIONS © 2026
            </p>
          </div>
        </div>

        {/* RIGHT AUTHENTICATION SECTION */}

        <div className="p-7 sm:p-10 lg:p-12">

          {/* MOBILE BRANDING */}

          <div className="md:hidden text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-rose-600" />
            </div>

            <h1 className="text-xl font-serif font-bold text-rose-950">
              ITSPRTYCREATIONS
            </h1>
          </div>

          <div className="mb-8">

            <p className="text-xs uppercase tracking-[3px] font-bold text-rose-600">
              Welcome to our store
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-3">
              {mode === 'login'
                ? 'Welcome Back!'
                : 'Create Account'}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {mode === 'login'
                ? 'Sign in with your email and password to continue.'
                : 'Create your account and start exploring our collections.'}
            </p>
          </div>

          {/* LOGIN / REGISTER SWITCH */}

          <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-7">

            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-3 text-sm font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-3 text-sm font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Register
            </button>

          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* AUTHENTICATION FORM */}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME - REGISTER ONLY */}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                />
              </div>
            </div>

            {/* PHONE - REGISTER ONLY */}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                  <span className="text-gray-400 font-normal">
                    {' '}(Optional)
                  </span>
                </label>

                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

                  <input
                    type="tel"
                    maxLength={15}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                  />
                </div>
              </div>
            )}

            {/* PASSWORD */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete={
                    mode === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === 'login'
                      ? 'Enter your password'
                      : 'Create a password (minimum 8 characters)'
                  }
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-rose-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {mode === 'login'
                    ? 'Sign In'
                    : 'Create My Account'}

                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* BOTTOM TEXT */}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">

            <p className="text-xs text-gray-500">
              {mode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}
            </p>

            <button
              type="button"
              onClick={() =>
                switchMode(
                  mode === 'login' ? 'register' : 'login'
                )
              }
              className="mt-2 text-sm font-bold text-rose-600 hover:text-rose-800"
            >
              {mode === 'login'
                ? 'Create an Account'
                : 'Sign In Instead'}
            </button>

          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Secure Customer Access
          </div>

        </div>
      </div>
    </div>
  );
}
