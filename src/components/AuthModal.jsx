import React, { useState, useRef } from 'react';
import { 
  X, 
  LogIn, 
  KeyRound, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Edit2
} from 'lucide-react';
import { apiSendEmailOtp, apiVerifyEmailOtp, apiSignIn, apiSignUp } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [useOtp, setUseOtp] = useState(true);
  
  const [email, setEmail] = useState('adityasinghfeb102005@gmail.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Aditya Singh');
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeCode, setActiveCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const digitRefs = useRef([]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await apiSendEmailOtp(email, fullName);
      setActiveCode(res.code);
      setOtpSent(true);
      setSuccessMsg(`OTP sent to ${email}. Check your inbox!`);
      setTimeout(() => digitRefs.current[0]?.focus(), 150);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const token = otpDigits.join('');
    if (token.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await apiVerifyEmailOtp(email, token, fullName);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error("Full name is required.");
        await apiSignUp(email, password, fullName);
      }
      const user = await apiSignIn(email, password);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    onAuthSuccess({
      id: 'usr-aditya-101',
      email: 'adityasinghfeb102005@gmail.com',
      user_metadata: { full_name: 'Aditya Singh', role: 'Verified Citizen' }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-md bg-[#0D1019] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
              🏛️
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {otpSent ? 'Verify Email OTP' : (mode === 'signup' ? 'Citizen Registration' : 'Citizen Sign In')}
              </h2>
              <p className="text-[11px] text-slate-400">
                CivicPulse Municipal Infrastructure Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        {!otpSent && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#080A10] rounded-xl my-4 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && !error && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* OTP Input Screen */}
        {otpSent ? (
          <div className="space-y-4 my-2">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Code sent to <strong className="text-white">{email}</strong></span>
              <button 
                onClick={() => setOtpSent(false)} 
                className="text-purple-400 hover:underline text-[11px] cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="flex items-center justify-between gap-1.5 py-2">
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={el => digitRefs.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-bold font-mono text-white bg-[#080A10] border border-white/[0.1] rounded-xl focus:border-purple-500 outline-none"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-purple-600/30"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Sign In</span>}
            </button>
          </div>
        ) : (
          /* Initial Input Form */
          <div className="space-y-3.5 my-2 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Aditya Singh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="aditya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 mt-2 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Request Email OTP</span>}
            </button>
          </div>
        )}

        {/* 1-Click Fast Access */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/25 hover:bg-purple-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>1-Click Citizen Login (Aditya Singh)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
