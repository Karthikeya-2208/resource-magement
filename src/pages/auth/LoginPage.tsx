import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Users,
  FolderKanban,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { signIn, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const { error } = await signIn(email, password);
    if (error) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  const handleDemoClick = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    loginAsDemo(role);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Left Column: Dark Blue Brand Panel matching Phase 2 Card 1 */}
      <div className="w-full lg:w-5/12 bg-[#0B1536] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                Resource<span className="text-blue-400">Hub</span>
              </span>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Enterprise Resource Management</p>
            </div>
          </div>

          {/* Value Propositions matching Phase 2 Card 1 */}
          <div className="space-y-6 my-10">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-200">Manage your team</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                <FolderKanban className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-200">Track projects and resources</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-200">Monitor budgets and expenses</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-200">Improve workforce utilization</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-200">A complete enterprise solution</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          <span>&copy; {new Date().getFullYear()} ResourceHub Enterprise &bull; Supabase Auth & RLS Active</span>
        </div>
      </div>

      {/* Right Column: Sign In Form matching Phase 2 Card 1 */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1.5">Sign in to your ResourceHub account</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions dispatched to your email.');
                }}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Google Sign In Divider matching Phase 2 Card 1 */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-xs text-slate-400 uppercase tracking-wider">Or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => handleDemoClick('admin', 'admin@demo.com')}
            className="w-full py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <p className="text-xs text-center text-slate-500 mt-4">
            Don't have an account?{' '}
            <a href="#admin" onClick={(e) => { e.preventDefault(); alert('Please ask your system administrator to provision your account.'); }} className="font-semibold text-blue-600 hover:text-blue-700">
              Contact your administrator
            </a>
          </p>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              1-Click Demo Accounts (Instant Test)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('admin', 'admin@demo.com')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left bg-slate-50"
              >
                <span className="text-xs font-bold text-slate-800 block">Admin</span>
                <span className="text-[10px] text-slate-400 block truncate">admin@demo.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('project_manager', 'manager@demo.com')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left bg-slate-50"
              >
                <span className="text-xs font-bold text-slate-800 block">Manager</span>
                <span className="text-[10px] text-slate-400 block truncate">manager@demo.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('employee', 'employee@demo.com')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left bg-slate-50"
              >
                <span className="text-xs font-bold text-slate-800 block">Employee</span>
                <span className="text-[10px] text-slate-400 block truncate">employee@demo.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
