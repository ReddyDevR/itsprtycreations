'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
X,
Mail,
Lock,
User as UserIcon,
Sparkles,
CheckCircle2,
Eye,
EyeOff,
ArrowLeft,
ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
isOpen: boolean;
onClose: () => void;
defaultTab?: 'customer' | 'admin';
}

export const AuthModal: React.FC\<AuthModalProps> = ({
isOpen,
onClose,
}) => {
const { login } = useAuth();

const [customerMode, setCustomerMode] = useState<
'login' | 'register' | 'forgot'

> ('login');

const [name, setName] = useState('');
const [phone, setPhone] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const [showPassword, setShowPassword] = useState(false);

const [loading, setLoading] = useState(false);
const [error, setError] = useState\<string | null>(null);
const [success, setSuccess] = useState\<string | null>(null);

if (!isOpen) return null;

const resetMessages = () => {
setError(null);
setSuccess(null);
};

const changeMode = (
mode: 'login' | 'register' | 'forgot'
) => {
setCustomerMode(mode);
resetMessages();
};

// =====================================
// CUSTOMER + ADMIN LOGIN
// =====================================

const handleCustomerLogin = async (
e: React.FormEvent
) => {
e.preventDefault();

```
resetMessages();
setLoading(true);

try {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || 'Invalid email or password'
    );
  }

  if (!data.user) {
    throw new Error('Invalid login response from server');
  }

  login(data.user);

  onClose();

  // Redirect admin to admin dashboard
  if (data.user.role === 'ADMIN') {
    window.location.href = '/admin';
  }

} catch (err: unknown) {
  setError(
    err instanceof Error
      ? err.message
      : 'Login failed. Please try again.'
  );
} finally {
  setLoading(false);
}
```

};

// =====================================
// CUSTOMER REGISTRATION
// =====================================

const handleCustomerRegister = async (
e: React.FormEvent
) => {
e.preventDefault();

```
resetMessages();
setLoading(true);

try {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || 'Registration failed'
    );
  }

  if (!data.user) {
    throw new Error('Invalid registration response');
  }

  login(data.user);

  onClose();

} catch (err: unknown) {
  setError(
    err instanceof Error
      ? err.message
      : 'Account creation failed'
  );
} finally {
  setLoading(false);
}
```

};

// =====================================
// FORGOT PASSWORD
// =====================================

const handleForgotPassword = async (
e: React.FormEvent
) => {
e.preventDefault();

```
resetMessages();

setError(
  'Password reset is not configured yet. Please contact customer support.'
);
```

};

return (
\<div    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"    onClick={onClose}  >
\<div
className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-rose-100 max-h-[95vh] overflow-y-auto"
onClick={(e) => e.stopPropagation()}
\>

```
    {/* ================================= */}
    {/* HEADER */}
    {/* ================================= */}

    <div className="relative px-6 pt-7 pb-7 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white text-center">

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 bg-white/90 rounded-full hover:bg-white transition-all"
        aria-label="Close login"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="inline-flex items-center justify-center w-15 h-15 mb-4 bg-white/10 rounded-full border border-white/20 p-3">
        <Sparkles className="w-8 h-8 text-amber-300" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight">
        ITSPRTYCREATIONS
      </h2>

      <p className="text-sm text-rose-100 mt-2">
        LTS Party Creations Online Shopping Portal
      </p>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-rose-100">
        <ShieldCheck className="w-4 h-4 text-amber-300" />
        Secure & Trusted Shopping Experience
      </div>

    </div>

    {/* ================================= */}
    {/* BODY */}
    {/* ================================= */}

    <div className="p-6 sm:p-7">

      {/* LOGIN / REGISTER TABS */}

      {customerMode !== 'forgot' && (

        <div className="flex border-b border-gray-100 mb-6">

          <button
            type="button"
            onClick={() => changeMode('login')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
              customerMode === 'login'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => changeMode('register')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
              customerMode === 'register'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Create Account
          </button>

        </div>

      )}

      {/* FORGOT PASSWORD HEADER */}

      {customerMode === 'forgot' && (

        <div className="mb-6">

          <button
            type="button"
            onClick={() => changeMode('login')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-700 mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>

          <h3 className="text-2xl font-bold text-gray-900">
            Forgot Password?
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            Enter your registered email address to reset your password.
          </p>

        </div>

      )}

      {/* ERROR MESSAGE */}

      {error && (

        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>

      )}

      {/* SUCCESS MESSAGE */}

      {success && (

        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">

          <CheckCircle2 className="w-5 h-5 shrink-0" />

          <span>{success}</span>

        </div>

      )}

      {/* ================================= */}
      {/* LOGIN FORM */}
      {/* ================================= */}

      {customerMode === 'login' && (

        <div>

          <div className="mb-6">

            <h3 className="text-2xl font-bold text-gray-900">
              Welcome Back!
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Sign in to continue shopping with us.
            </p>

          </div>

          <form
            onSubmit={handleCustomerLogin}
            className="space-y-5"
          >

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
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <div className="flex justify-between items-center mb-2">

                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => changeMode('forgot')}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                >
                  Forgot Password?
                </button>

              </div>

              <div className="relative">

                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-900 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'SIGN IN'}
            </button>

          </form>

          {/* REGISTER LINK */}

          <div className="mt-6 text-center">

            <p className="text-sm text-gray-500">
              Don't have an account?{' '}

              <button
                type="button"
                onClick={() => changeMode('register')}
                className="font-bold text-rose-700 hover:text-rose-900"
              >
                Create Account
              </button>

            </p>

          </div>

        </div>

      )}

      {/* ================================= */}
      {/* REGISTRATION FORM */}
      {/* ================================= */}

      {customerMode === 'register' && (

        <div>

          <div className="mb-6">

            <h3 className="text-2xl font-bold text-gray-900">
              Create Your Account
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Join us and discover beautiful celebrations.
            </p>

          </div>

          <form
            onSubmit={handleCustomerRegister}
            className="space-y-4"
          >

            {/* FULL NAME */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>

              <div className="relative">

                <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                />

              </div>

            </div>

            {/* MOBILE NUMBER */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>

              <input
                type="tel"
                autoComplete="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
              />

            </div>

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
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Create Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>

            </div>

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-900 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>

          </form>

          <div className="mt-5 text-center">

            <p className="text-sm text-gray-500">
              Already have an account?{' '}

              <button
                type="button"
                onClick={() => changeMode('login')}
                className="font-bold text-rose-700 hover:text-rose-900"
              >
                Sign In
              </button>

            </p>

          </div>

        </div>

      )}

      {/* ================================= */}
      {/* FORGOT PASSWORD FORM */}
      {/* ================================= */}

      {customerMode === 'forgot' && (

        <form
          onSubmit={handleForgotPassword}
          className="space-y-5"
        >

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Registered Email Address
            </label>

            <div className="relative">

              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

              <input
                type="email"
                required
                placeholder="yourname@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
              />

            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-800 to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-200"
          >
            RESET PASSWORD
          </button>

          <p className="text-xs text-center text-gray-400">
            Secure account recovery for your shopping account.
          </p>

        </form>

      )}

      {/* FOOTER */}

      <div className="mt-6 pt-5 border-t border-gray-100">

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">

          <ShieldCheck className="w-4 h-4 text-green-600" />

          Your account and information are protected.

        </div>

        <p className="text-center text-[11px] text-gray-400 mt-3">
          © {new Date().getFullYear()} ITSPRTYCREATIONS
        </p>

      </div>

    </div>

  </div>
</div>
```

);
};
