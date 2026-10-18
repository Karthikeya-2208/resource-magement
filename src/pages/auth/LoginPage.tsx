import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { signIn, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      {/* Left Column: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 bg-white shadow-xl z-10">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
                Resource<span className="text-blue-600">Hub</span>
              </span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise Resource Management</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Your Workspace</h2>
            <p className="text-sm text-slate-500 mt-1">Manage people, projects and resources in one place.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 transition-all placeholder:text-slate-400"
                />
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
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link has been dispatched to administrators.'); }} className="font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Panel matching reference image */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Demo Accounts</span>
              <span className="text-[11px] text-blue-600 font-medium">Click to 1-Click Login</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoClick('admin', 'admin@demo.com')}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group shadow-sm bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Admin</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">admin@demo.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('project_manager', 'manager@demo.com')}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group shadow-sm bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Manager</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">manager@demo.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('employee', 'employee@demo.com')}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group shadow-sm bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Employee</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">employee@demo.com</p>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">Password for all demo accounts: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">Password123!</code></p>
          </div>
        </div>

        <div className="text-xs text-slate-400 mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} ResourceHub Enterprise</span>
          <span>Security & RLS Enforced</span>
        </div>
      </div>

      {/* Right Column: Architectural Hero matching reference image */}
      <div className="hidden lg:flex w-1/2 relative bg-[#070D1E] overflow-hidden flex-col justify-end p-16 text-white">
        {/* Background gradient graphics simulating glass architecture */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070D1E] via-[#0A1633]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.3),rgba(255,255,255,0))] z-0" />
        
        {/* Modern geometric high-rise architecture grid */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-20 max-w-lg mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 backdrop-blur-sm">
            <Building className="w-3.5 h-3.5" />
            <span>Next-Gen Resource Orchestration</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-white">
            Build Smarter Teams for a Better Tomorrow
          </h1>
          <p className="text-lg text-slate-300 font-light tracking-wide mb-6">
            People &bull; Projects &bull; Progress
          </p>
          
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400">Capacity Guardrails</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Real-Time</p>
              <p className="text-xs text-slate-400">Budget Analytics</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">RLS Active</p>
              <p className="text-xs text-slate-400">Role-Based Security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
