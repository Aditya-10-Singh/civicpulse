import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, Mail, User, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiSignIn, apiSignUp, isSupabaseConfigured } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const hasLiveSupabase = isSupabaseConfigured();

    if (!hasLiveSupabase) {
      // Demo authentication simulation
      setTimeout(() => {
        setLoading(false);
        const demoUser = {
          id: 'demo-user-123',
          email: email || 'aditya.singh00552@gmail.com',
          user_metadata: { full_name: fullName || (email ? email.split('@')[0] : 'Aditya Singh') }
        };
        onAuthSuccess(demoUser);
        onClose();
      }, 500);
      return;
    }

    try {
      if (mode === 'signup') {
        await apiSignUp(email, password, fullName);
        setSuccessMsg("Account created! You can now log in or check confirmation email.");
        setMode('login');
      } else {
        const data = await apiSignIn(email, password);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 'usr-aditya-singh',
      email: 'aditya.singh00552@gmail.com',
      user_metadata: { full_name: 'Aditya Singh' }
    };
    onAuthSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'login' ? 'Citizen Sign In' : 'Register New Account'}
              </h2>
              <p className="text-xs text-slate-400">
                Powered by Supabase Auth (JWT & RLS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-xl my-5 border border-slate-700/60">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Aditya Singh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="citizen@civicpulse.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50 mt-2"
          >
            {loading 
              ? 'Authenticating...' 
              : (mode === 'login' ? 'Sign In' : 'Create Supabase Account')}
          </button>
        </form>

        {/* Quick Demo Sign In Button (Crucial for evaluation!) */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <p className="text-center text-xs text-slate-400 mb-2">
            Instant viva testing without typing credentials:
          </p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>1-Click Demo Login as Aditya Singh</span>
          </button>
        </div>

      </div>
    </div>
  );
}
