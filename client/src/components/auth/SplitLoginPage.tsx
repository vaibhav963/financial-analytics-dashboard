import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  Layers,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

export const SplitLoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('admin@gmail.com');
  const [password, setPassword] = useState<string>('Pass@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  const handleFillDemo = () => {
    setEmail('admin@gmail.com');
    setPassword('Pass@123');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-slateNavy-900 selection:bg-loopr-500 selection:text-white font-sans">
      {/* ------------------------------------------------------------- */}
      {/* LEFT SECTION: Platform Brand, Live AI Insight & Anomaly Card */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:w-[52%] bg-gradient-to-br from-[#F4F7FC] via-[#EEF2FB] to-[#E9EEF9] border-b lg:border-b-0 lg:border-r border-slateNavy-200/80 p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Ambient Background Accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-loopr-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5 mb-8 lg:mb-0">
          <div className="w-11 h-11 rounded-2xl bg-slateNavy-950 flex items-center justify-center text-white shadow-md">
            <Layers className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-slateNavy-950">
                Fin<span className="text-loopr-600">Flow</span>
              </span>
            </div>
            <p className="text-[11px] font-bold text-slateNavy-500 tracking-wider uppercase">
              Financial Intelligence Platform
            </p>
          </div>
        </div>

        {/* Center: Live AI Risk / Cashflow Intelligence Card */}
        <div className="relative z-10 my-auto py-6 max-w-xl w-full mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slateNavy-900/5 border border-slateNavy-200/90 relative overflow-hidden border-l-4 border-l-rose-500">
            {/* Header Tags */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Cashflow Risk &amp; Settlement Alert</span>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-slateNavy-950 font-display leading-snug tracking-tight mb-3">
              High Settlement Volume &amp; Operating Margin in Q4
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slateNavy-600 leading-relaxed mb-6 font-normal">
              A 62.0% settlement velocity across <strong className="font-semibold text-slateNavy-900">300 audited records</strong> with <strong className="font-semibold text-slateNavy-900">+$133.2k operating surplus</strong>. 114 in-flight records currently queued for clearance.
            </p>

            {/* 3 Metric Mini-Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-slateNavy-50/80 border border-slateNavy-200/60">
                <span className="text-[10px] font-bold text-slateNavy-400 uppercase tracking-wider block mb-1">
                  Settlement Rate
                </span>
                <span className="text-sm sm:text-base font-extrabold text-rose-600 font-display">
                  62.0%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slateNavy-50/80 border border-slateNavy-200/60">
                <span className="text-[10px] font-bold text-slateNavy-400 uppercase tracking-wider block mb-1">
                  Operating Margin
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slateNavy-900 font-display">
                  39.2%
                </span>
                <span className="text-[10px] text-emerald-600 font-bold ml-1 block sm:inline">Surplus</span>
              </div>

              <div className="p-3 rounded-2xl bg-slateNavy-50/80 border border-slateNavy-200/60">
                <span className="text-[10px] font-bold text-slateNavy-400 uppercase tracking-wider block mb-1">
                  Pending Volume
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slateNavy-900 font-display">
                  $205.3k
                </span>
              </div>
            </div>

            {/* Bottom Analyst Avatars & Action Trigger */}
            <div className="flex items-center justify-between pt-4 border-t border-slateNavy-100">
              <div className="flex items-center -space-x-2">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=AlexVance"
                  alt="Analyst Alex Vance"
                  className="w-8 h-8 rounded-full border-2 border-white bg-slateNavy-100 shadow-sm"
                />
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaRostova"
                  alt="Admin Elena Rostova"
                  className="w-8 h-8 rounded-full border-2 border-white bg-slateNavy-100 shadow-sm"
                />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slateNavy-200 text-slateNavy-700 text-[10px] font-bold flex items-center justify-center shadow-sm">
                  +4
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleFillDemo()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slateNavy-950 hover:bg-slateNavy-800 text-white text-xs font-bold transition-all shadow-sm group"
              >
                <span>Sign in to take action</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Platform Info */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 text-[11px] text-slateNavy-400 border-t border-slateNavy-200/40">
          <p>Enterprise Financial Analytics Platform</p>
          <p>Real-Time MongoDB Aggregation Pipeline</p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT SECTION: Standard Clean Login Form */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:w-[48%] bg-white p-6 sm:p-12 lg:p-16 flex flex-col justify-between">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slateNavy-950 font-display tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slateNavy-500 mt-2">
              Access your financial analytics and cashflow ecosystem.
            </p>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold text-slateNavy-700 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateNavy-400 text-sm font-semibold pointer-events-none">
                  @
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. analyst@analytics.com"
                  className="w-full pl-9 pr-4 py-3 text-sm font-medium rounded-xl border border-slateNavy-200 bg-slateNavy-50/50 hover:border-slateNavy-300 focus:bg-white focus:border-slateNavy-900 focus:ring-1 focus:ring-slateNavy-900 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slateNavy-700 block">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slateNavy-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 text-sm font-medium rounded-xl border border-slateNavy-200 bg-slateNavy-50/50 hover:border-slateNavy-300 focus:bg-white focus:border-slateNavy-900 focus:ring-1 focus:ring-slateNavy-900 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slateNavy-400 hover:text-slateNavy-700 transition-colors p-1 rounded-lg focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slateNavy-700" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>



            {/* Test Credentials Callout Box */}
            <div className="p-4 rounded-2xl bg-slateNavy-50/80 border border-slateNavy-200/80">
              <span className="text-[11px] font-bold text-slateNavy-800 uppercase tracking-wider block mb-2">
                Test Credentials:
              </span>
              <div className="space-y-1.5 text-xs text-slateNavy-600 font-mono">
                <button
                  type="button"
                  onClick={() => handleFillDemo()}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slateNavy-200 transition-all text-left group"
                >
                  <span>
                    <strong className="text-slateNavy-900 font-sans">Super Admin:</strong> admin@gmail.com / Pass@123
                  </span>
                  <span className="text-[10px] font-sans font-bold text-loopr-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Fill →
                  </span>
                </button>
              </div>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-slateNavy-950 hover:bg-slateNavy-900 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In &amp; Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-slateNavy-100 text-[11px] text-slateNavy-400">
          <p>© 2026 Financial Analytics Intelligence</p>
        </div>
      </div>
    </div>
  );
};
