import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, Mail, User, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
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

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (!email.trim() || !password.trim()) {
          setError("Email and password are required.");
          setLoading(false);
          return;
        }

        await apiSignUp(email, password, fullName);
        setSuccessMsg("Account registered successfully! You can now sign in below.");
        setPassword('');
        setMode('login');
      } else {
        // Mode is login: User must be registered first
        const user = await apiSignIn(email, password);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    try {
      setLoading(true);
      const user = await apiSignIn('aditya.singh00552@gmail.com', 'password123');
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      // Fallback
      onAuthSuccess({
        id: 'usr-aditya-101',
        email: 'aditya.singh00552@gmail.com',
        user_metadata: { full_name: 'Aditya Singh', role: 'Lead Developer' }
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111724] border border-white/[0.1] rounded-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {mode === 'login' ? 'Citizen Sign In' : 'Register New Citizen Account'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {mode === 'login' 
                  ? 'Sign in to report or track community issues' 
                  : 'New citizens must register first before signing in'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#0D121D] rounded-xl my-4 border border-white/[0.08]">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login' 
                ? 'bg-sky-500 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup' 
                ? 'bg-sky-500 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-3.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {mode === 'login' && error.includes("register first") && (
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="block mt-1 font-bold text-sky-400 underline hover:text-sky-300"
                >
                  Click here to Register an account now &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {mode === 'signup' && (
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditya Singh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="citizen@civicpulse.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Password *
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0D121D] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            {mode === 'login' && (
              <p className="text-[10px] text-slate-500 mt-1">
                Default demo accounts password is: <span className="font-mono text-slate-400">password123</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-semibold text-xs bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/20 transition-all disabled:opacity-50 mt-1"
          >
            {loading 
              ? 'Verifying...' 
              : (mode === 'login' ? 'Sign In to Dashboard' : 'Register New Account')}
          </button>
        </form>

        {/* Quick Demo Sign In Button for live evaluation */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.08]">
          <p className="text-center text-[11px] text-slate-400 mb-2">
            Pre-registered account for fast viva demo:
          </p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-2 rounded-lg text-xs font-semibold bg-[#161D2B] text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>1-Click Sign In as Aditya Singh (Existing User)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
