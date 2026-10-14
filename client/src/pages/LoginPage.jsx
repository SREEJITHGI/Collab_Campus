import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data.data?.token) {
        const { token, user } = res.data.data;
        login(token, user);

        // Redirect based on role
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'faculty') navigate('/faculty');
        else navigate(redirectPath === '/login' ? '/dashboard' : redirectPath);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to sign in. Please verify your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoRole) => {
    if (demoRole === 'student') {
      setEmail('student@campus.edu');
      setPassword('Password123!');
    } else if (demoRole === 'faculty') {
      setEmail('faculty@campus.edu');
      setPassword('Password123!');
    } else if (demoRole === 'admin') {
      setEmail('admin@campus.edu');
      setPassword('AdminPassword123!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to CollabCampus
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Access your university projects, notes, and campus portal
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pill Bar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>One-Click Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-medium transition-colors text-center text-[11px]"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('faculty')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-medium transition-colors text-center text-[11px]"
            >
              👨‍🏫 Faculty
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-medium transition-colors text-center text-[11px]"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label-field" htmlFor="login-email">
              Academic or Registered Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" defaultChecked />
              <span>Remember session</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact campus IT administrator or use the demo accounts to sign in.'); }} className="text-emerald-600 hover:underline font-medium">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2 font-semibold shadow-md shadow-emerald-600/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
